using Commerce.Application.Contracts.Services.Coupons;
using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Specifications.Orders;
using Microsoft.Extensions.Logging;

namespace Commerce.Infrastructure.Services;

public class OrderService(ILogger<OrderService> logger, IStoreUnitOfWork storeUnit, ShoppingCartCacheService cartCache, ICouponService couponService) : IOrderService
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
            Discount = cart.Discount, // authoritative — already reflected in what Paymob charged
            CouponCode = cart.CouponCode,
            PaymentSummary = cart.PaymentSummary,
            PaymentTransactionId = cart.PaymentReference!,
            BuyerEmail = cart.BillingAddress.Email,
            Status = OrderStatus.PaymentReceived
        };

        storeUnit.Orders.Add(order);

        if (!string.IsNullOrWhiteSpace(cart.CouponCode) && cart.Discount > 0)
        {
            try
            {
                var coupon = await storeUnit.Coupons.GetByCodeAsync(cart.CouponCode);
                if (coupon is not null)
                    await couponService.RedeemAsync(coupon.Id, order.BuyerEmail, order.Id, cart.Discount);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to record coupon redemption for order {OrderId}, coupon {CouponCode}", order.Id, cart.CouponCode);
            }
        }

        if (!await storeUnit.CommitAsync()) return null;

        return order;
    }
}
