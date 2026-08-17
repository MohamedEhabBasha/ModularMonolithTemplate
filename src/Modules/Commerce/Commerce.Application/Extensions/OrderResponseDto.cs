using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Application.Extensions;

public class OrderResponseDto
{
    public int Id { get; set; }
    public DateTime OrderDate { get; set; }
    public required string BuyerEmail { get; set; }
    public required BillingAddress BillingAddress { get; set; }
    public required string DeliveryMethod { get; set; }
    public decimal DeliveryPrice { get; set; }
    public required PaymentSummary PaymentSummary { get; set; }
    public required List<OrderItemDto> OrderItems { get; set; }
    public decimal Subtotal { get; set; }
    public required string Status { get; set; }
    public decimal Total { get; set; }
    public required string PaymentTransactionId { get; set; }
}
public class OrderItemDto
{
    public int ProductId { get; set; }
    public required string ProductName { get; set; }
    public required string PictureUrl { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
}