using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Extensions;
using Commerce.Core.Entities.OrderAggregate;
using Commerce.Infrastructure.Services;
using Commerce.Infrastructure.Services.Payment.Paymob;
using System.Security.Cryptography;
using System.Text;

namespace App.API.Modules.Commerce;

public class PaymobWebhookController
    (IConfiguration config, 
    ShoppingCartCacheService cartCache, 
    IOrderService orderService,
    ICommerceNotifier notifier) : BaseController
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

                cart.PaymentSummary = new PaymentSummary
                {
                    Last4 = payload.Obj.SourceData.Pan,     // Paymob's "pan" is already just the last 4 digits, e.g. "2346"
                    Brand = payload.Obj.SourceData.SubType  // e.g. "MasterCard"
                };

                await cartCache.SetCartAsync(cart);

                if (cart.PaymentStatus == "paid")
                {
                    // fire-and-forget from the webhook's perspective
                    var order = await orderService.CreateOrderFromCartAsync(cartId);
                    await notifier.PaymentStatusChangedAsync(cartId, new PaymentStatusUpdate("paid", order?.ToResponseDto()));
                }else
                {
                    await notifier.PaymentStatusChangedAsync(cartId, new PaymentStatusUpdate("failed", null));
                }
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
