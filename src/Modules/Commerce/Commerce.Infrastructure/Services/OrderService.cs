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

        // Duplicate webhook → return the existing order; stock is never decremented twice.
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

        // ---------- Stock, order and coupon in ONE transaction ----------
        // 1. Stock is taken with an atomic conditional UPDATE (TryDecrementStockAsync),
        //    so concurrent buyers can't buy more units than exist.
        // 2. The coupon redemption runs inside this same transaction.
        // 3. The order is saved before the coupon is redeemed, so the redemption
        //    records the real order.Id instead of 0.
        // Any failure rolls back all three: no order, no stock taken, no coupon used.

        // Merge lines for the same product, and sort so every checkout locks rows
        // in the same order (two carts {A, B} and {B, A} can't deadlock each other).
        var stockLines = cart.Items
            .GroupBy(i => i.ProductId)
            .Select(g => (ProductId: g.Key, Quantity: g.Sum(i => i.Quantity)))
            .OrderBy(l => l.ProductId)
            .ToList();

        var hasCoupon = !string.IsNullOrWhiteSpace(cart.CouponCode) && cart.Discount > 0;
        var outOfStockProductId = 0;

        // Stock, order and coupon redemption commit together, or not at all.
        var saved = await storeUnit.ExecuteInTransactionAsync(async () =>
        {
            outOfStockProductId = 0; // reset in case the execution strategy retries

            // 1. Take stock for every product
            foreach (var (productId, quantity) in stockLines)
            {
                if (!await storeUnit.Products.TryDecrementStockAsync(productId, quantity))
                {
                    outOfStockProductId = productId;
                    return false; // rolls back any decrements already made
                }
            }

            // 2. Save the order: order.Id gets its real value here (still uncommitted)
            if (!await storeUnit.CommitAsync()) return false;

            // 3. Redeem the coupon with the real order.Id
            if (hasCoupon)
            {
                var coupon = await storeUnit.Coupons.GetByCodeAsync(cart.CouponCode!);
                var result = coupon is null
                    ? CouponRedemptionResult.InvalidCoupon
                    : await couponService.TryRedeemAsync(coupon.Id, order.BuyerEmail, order.Id, cart.Discount);

                if (result == CouponRedemptionResult.Redeemed)
                {
                    // 4. Save the redemption row
                    await storeUnit.CommitAsync();
                }
                else
                {
                    // The buyer already paid the discounted price, so the order is honored anyway
                    logger.LogWarning(
                        "Coupon {CouponCode} not redeemed for order {OrderId}: {Result}. Discount honored.",
                        cart.CouponCode, order.Id, result);
                }
            }

            return true;
        });

        if (!saved)
        {
            if (outOfStockProductId != 0)
                logger.LogWarning(
                    "Paid cart {CartId} could not be fulfilled: product {ProductId} is out of stock. Refund required.",
                    cartId, outOfStockProductId);

            return null;
        }

        return order;
    }
}