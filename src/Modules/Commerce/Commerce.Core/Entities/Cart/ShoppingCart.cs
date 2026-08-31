using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Core.Entities.Cart;

public class ShoppingCart
{
    public required string Id { get; set; }
    public List<CartItem> Items { get; set; } = [];
    public int? DeliveryMethodId { get; set; }
    public string? PaymentReference { get; set; } // gateway's transaction/order id — decides create vs. update
    public string? ClientToken { get; set; }      // embedded/SDK flows (Stripe's ClientSecret)
    public string? RedirectUrl { get; set; }      // hosted-checkout flows (Paymob and most MENA gateways)
    public string? PaymentStatus { get; set; } // null, "pending", "paid", or "failed"
    public BillingAddress? BillingAddress { get; set; } // snapshotted at payment creation — only record of who/where once the webhook fires
    public PaymentSummary? PaymentSummary { get; set; } // set by the webhook from Paymob's own payload, never trusted from the client
    public string? CouponCode { get; set; }
    public decimal Discount { get; set; }
}
