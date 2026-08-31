using BuildingBlocks.Application.Exceptions;
using Commerce.Application.Contracts.Services.Coupons;
using Commerce.Application.Contracts.Services.Payment;
using Commerce.Core.Entities.Cart;
using Commerce.Infrastructure.Services.Coupons;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;
using System.Text.Json;

namespace Commerce.Infrastructure.Services.Payment.Paymob;

public class PaymobPaymentService(
    ShoppingCartCacheService _cartCache,
    ICouponService couponService,
    IStoreUnitOfWork storeUnit,
    HttpClient _httpClient,
    IConfiguration config) : IPaymentService
{

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
    };
    public async Task<ShoppingCart?> CreateOrUpdatePayment(PaymentRequest paymentRequest)
    {
        var cart = await _cartCache.GetCartAsync(paymentRequest.CartId);
        if (cart is null) return null;

        var baseUrl = config["PaymentSettings:Paymob:BaseUrl"]!;
        var secretKey = config["PaymentSettings:Paymob:SecretKey"];
        var publicKey = config["PaymentSettings:Paymob:PublicKey"];
        var integrationId = int.Parse(config["PaymentSettings:Paymob:IntegrationId"]!);

        var items = cart.Items.Select(i => new PaymobItem
        {
            Name = i.ProductName,
            Amount = (long)(i.Price * 100), // piasters
            Quantity = i.Quantity
        }).ToList();

        if (cart.DeliveryMethodId.HasValue)
        {
            var delivery = await storeUnit.DeliveryMethods.GetByIdAsync(cart.DeliveryMethodId.Value);
            if (delivery is not null)
            {
                // Paymob requires amount == sum(items[].amount) exactly — delivery
                // needs its own line item, not just folded into the total.
                items.Add(new PaymobItem { Name = "Delivery", Amount = (long)(delivery.Price * 100), Quantity = 1 });
            }
        }

        var billingEmail = paymentRequest.BillingAddress.Email
                ?? throw new InvalidOperationException("Billing data missing on cart — collect it before calling CreateOrUpdatePayment.");

        if (!string.IsNullOrWhiteSpace(cart.CouponCode))
        {
            var subtotal = cart.Items.Sum(i => i.Price * i.Quantity);

            var revalidated = await couponService.PreviewAsync(cart.CouponCode, billingEmail, subtotal);
            
            // authoritative, fresh — never blindly trust the stale guest-time value
            cart.Discount = revalidated.DiscountAmount; 
        }


        if (cart.Discount > 0)
        {
            items.Add(new PaymobItem { Name = "Discount", Amount = -(long)(cart.Discount * 100), Quantity = 1 });
        }

        var requestBody = new PaymobIntentionRequest
        {
            Amount = items.Sum(i => i.Amount * i.Quantity),
            PaymentMethods = [integrationId],
            Items = items,
            SpecialReference = cart.Id + Guid.NewGuid().ToString("N")[..8],
            NotificationUrl = "https://mule-lumping-moody.ngrok-free.dev/api/paymobWebhook/webhook",
            RedirectionUrl = $"{config["AppSettings:ClientBaseUrl"]}/checkout/confirmation",
            BillingData = new BillingAddress
            {
                FirstName = paymentRequest.BillingAddress.FirstName,
                LastName = paymentRequest.BillingAddress.LastName,
                Email = paymentRequest.BillingAddress.Email,
                PhoneNumber = paymentRequest.BillingAddress.PhoneNumber,
                Country = paymentRequest.BillingAddress.Country,
                City = paymentRequest.BillingAddress.City,
                Street = paymentRequest.BillingAddress.Street
            }
        };

        var isUpdate = !string.IsNullOrEmpty(cart.PaymentReference);
        using var request = new HttpRequestMessage(
            isUpdate ? HttpMethod.Put : HttpMethod.Post,
            isUpdate ? $"{baseUrl}/v1/intention/{cart.PaymentReference}" : $"{baseUrl}/v1/intention/");

        request.Headers.Add("Authorization", $"Token {secretKey}");
        request.Content = JsonContent.Create(requestBody, options: JsonOptions);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new BadRequestException($"Paymob {(isUpdate ? "update" : "create")} intention failed ({(int)response.StatusCode}): {errorBody}");
        }

        response.EnsureSuccessStatusCode();

        var intention = await response.Content.ReadFromJsonAsync<PaymobIntentionResponse>(JsonOptions);

        cart.PaymentReference = intention!.ClientSecret; // Paymob updates are addressed by client_secret
        cart.RedirectUrl = $"{baseUrl}/unifiedcheckout/?publicKey={publicKey}&clientSecret={intention.ClientSecret}";

        cart.BillingAddress = paymentRequest.BillingAddress;
        await _cartCache.SetCartAsync(cart);
        return cart;
    }
}
