using Commerce.Infrastructure.Services;
using Commerce.Infrastructure.Services.Payment.Paymob;
using System.Security.Cryptography;
using System.Text;

namespace App.API.Modules.Commerce;

public class PaymobWebhookController(IConfiguration config, ShoppingCartCacheService cartCache) : BaseController
{
    [HttpPost("webhook")]
    public async Task<IActionResult> Webhook([FromQuery] string hmac, [FromBody] PaymobWebhookPayload payload)
    {
        var expected = ComputeHmac(payload.Obj, config["PaymentSettings:Paymob:Hmac"]!);

        if (!CryptographicOperations.FixedTimeEquals(
                Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(hmac ?? "")))
        {
            return Unauthorized(); // signature didn't match — not really from Paymob, ignore it
        }

        var merchantOrderId = payload.Obj.Order.MerchantOrderId;
        var cartId = merchantOrderId is { Length: > 8 } id ? id[..^8] : merchantOrderId;

        if (payload.Type == "TRANSACTION" && !string.IsNullOrEmpty(cartId))
        {
            var cart = await cartCache.GetCartAsync(cartId);
            if (cart is not null)
            {
                cart.PaymentStatus = payload.Obj.Pending ? "pending" : payload.Obj.Success ? "paid" : "failed";
                await cartCache.SetCartAsync(cart);
            }
        }

        return Ok(); // Paymob just needs the 2xx
    }
    [HttpGet("status/{merchantOrderId}")]
    public async Task<ActionResult<object>> GetStatus(string merchantOrderId)
    {
        var cartId = merchantOrderId is { Length: > 8 } id ? id[..^8] : merchantOrderId;

        var cart = await cartCache.GetCartAsync(cartId);

        return cart is null ? NotFound() : Ok(new { status = cart.PaymentStatus ?? "pending" });
    }
    private static string ComputeHmac(PaymobTransactionObj o, string secret)
    {
        var data = string.Concat(
            o.AmountCents, o.CreatedAt, o.Currency,
            o.ErrorOccured.ToString().ToLowerInvariant(),
            o.HasParentTransaction.ToString().ToLowerInvariant(),
            o.Id, o.IntegrationId,
            o.Is3dSecure.ToString().ToLowerInvariant(),
            o.IsAuth.ToString().ToLowerInvariant(),
            o.IsCapture.ToString().ToLowerInvariant(),
            o.IsRefunded.ToString().ToLowerInvariant(),
            o.IsStandalonePayment.ToString().ToLowerInvariant(),
            o.IsVoided.ToString().ToLowerInvariant(),
            o.Order.Id, o.Owner,
            o.Pending.ToString().ToLowerInvariant(),
            o.SourceData.Pan, o.SourceData.SubType, o.SourceData.Type,
            o.Success.ToString().ToLowerInvariant());

        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(secret));
        return Convert.ToHexString(hmac.ComputeHash(Encoding.UTF8.GetBytes(data))).ToLowerInvariant();
    }
}
