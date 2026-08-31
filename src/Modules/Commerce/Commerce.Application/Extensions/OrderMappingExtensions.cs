using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Application.Extensions;

public static class OrderMappingExtensions
{
    public static OrderResponseDto ToResponseDto(this Order order)
    {
        return new OrderResponseDto
        {
            Id = order.Id,
            OrderDate = order.OrderDate,
            BuyerEmail = order.BuyerEmail,
            BillingAddress = order.BillingAddress,
            DeliveryMethod = order.DeliveryMethod.ShortName,
            DeliveryPrice = order.DeliveryMethod.Price,
            PaymentSummary = order.PaymentSummary!,
            OrderItems = [.. order.OrderItems.Select(i => i.ToDto())],
            Discount = order.Discount,
            CouponCode = order.CouponCode ?? "N/A",
            Subtotal = order.Subtotal,
            Status = order.Status.ToString(),
            Total = order.Subtotal + order.DeliveryMethod.Price - order.Discount,
            PaymentTransactionId = order.PaymentTransactionId
        };
    }
    public static OrderItemDto ToDto(this OrderItem item)
    {
        return new OrderItemDto
        {
            ProductId = item.ItemOrdered.ProductId,
            ProductName = item.ItemOrdered.ProductName,
            PictureUrl = item.ItemOrdered.PictureUrl,
            Price = item.Price,
            Quantity = item.Quantity
        };
    }
}
