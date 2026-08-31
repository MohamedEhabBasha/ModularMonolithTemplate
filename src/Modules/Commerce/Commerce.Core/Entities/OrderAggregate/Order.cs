namespace Commerce.Core.Entities.OrderAggregate;

public class Order : BaseEntity
{
    public DateTime OrderDate { get; set; } = DateTime.UtcNow;
    public required string BuyerEmail { get; set; }
    public BillingAddress BillingAddress { get; set; } = null!;
    public DeliveryMethod DeliveryMethod { get; set; } = null!;
    public decimal DeliveryPrice { get; set; } // snapshot at order time
    public decimal Discount { get; set; }
    public string? CouponCode { get; set; }
    public PaymentSummary? PaymentSummary { get; set; } 
    public List<OrderItem> OrderItems { get; set; } = [];
    public decimal Subtotal { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public required string PaymentTransactionId { get; set; }

    public decimal GetTotal() => Subtotal + DeliveryPrice - Discount;
}
