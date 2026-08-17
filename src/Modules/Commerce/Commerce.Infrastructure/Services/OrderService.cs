using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Specifications.Orders;

namespace Commerce.Infrastructure.Services;

public class OrderService(IStoreUnitOfWork storeUnit, ShoppingCartCacheService cartCache) : IOrderService
{
    public async Task<Order?> CreateOrderFromCartAsync(string cartId)
    {
        var cart = await cartCache.GetCartAsync(cartId);
        if (cart is null || cart.BillingAddress is null || cart.DeliveryMethodId is null)
            return null;

        if (cart.PaymentStatus != "paid")
            return null;

        var existing = await storeUnit.Orders.GetEntityWithSpec(new OrderByPaymentReferenceSpec(cart.PaymentReference!));
        if (existing is not null) return existing;

        var items = new List<OrderItem>();
        foreach (var item in cart.Items)
        {
            var product = await storeUnit.Products.GetByIdAsync(item.ProductId);
            if (product is null) return null;

            items.Add(new OrderItem
            {
                ItemOrdered = new ProductItemOrdered
                {
                    ProductId = item.ProductId,
                    ProductName = item.ProductName,
                    PictureUrl = item.PictureUrl
                },
                Price = product.Price,
                Quantity = item.Quantity
            });
        }

        var deliveryMethod = await storeUnit.DeliveryMethods.GetByIdAsync(cart.DeliveryMethodId.Value);
        if (deliveryMethod is null) return null;

        var order = new Order
        {
            OrderItems = items,
            DeliveryMethod = deliveryMethod,
            DeliveryPrice = deliveryMethod.Price,
            BillingAddress = cart.BillingAddress,
            Subtotal = items.Sum(x => x.Price * x.Quantity),
            PaymentSummary = cart.PaymentSummary,
            PaymentTransactionId = cart.PaymentReference!,
            BuyerEmail = cart.BillingAddress.Email,
            Status = OrderStatus.PaymentReceived
        };

        storeUnit.Orders.Add(order);
        if (!await storeUnit.CommitAsync()) return null;

        return order;
    }
}
