using Commerce.Application.Contracts.Services.Orders;
using Commerce.Core.Entities;
using Commerce.Core.Entities.Cart;
using Commerce.Core.Entities.OrderAggregate;
using Commerce.Core.Entities.Products;
using Commerce.Infrastructure.Data;
using Commerce.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using MwGoods.IntegrationTests.Fixtures;
using MwGoods.IntegrationTests.Helpers;

namespace MwGoods.IntegrationTests.Commerce.Orders;

public sealed class CheckoutOversellingTests(CommerceFixture fixture) : IClassFixture<CommerceFixture>
{
    private const int Stock = 10;
    private const int Buyers = 50;

    [Fact]
    public async Task Fifty_paid_carts_for_ten_units_create_exactly_ten_orders()
    {
        var ct = TestContext.Current.CancellationToken;

        // Arrange: one product with 10 in stock, and 50 carts already marked "paid"
        var (productId, deliveryMethodId) = await SeedProductAndDeliveryAsync();
        var cartIds = await SeedPaidCartsAsync(productId, deliveryMethodId);

        // Act: 50 "webhooks" create orders at the same moment.
        // Each buyer gets its own scope = its own StoreContext, like a separate request.
        var orders = await Concurrently.Run(Buyers, async i =>
        {
            await using var scope = fixture.Services.CreateAsyncScope();
            var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
            return await orderService.CreateOrderFromCartAsync(cartIds[i]);
        });

        // Assert: read with a fresh context so we see what's really in SQL Server
        await using var verify = fixture.Services.CreateAsyncScope();
        var db = verify.ServiceProvider.GetRequiredService<StoreContext>();

        var product = await db.Products.SingleAsync(p => p.Id == productId, ct);
        var savedOrders = await db.Orders.CountAsync(
            o => o.OrderItems.Any(i => i.ItemOrdered.ProductId == productId), ct);

        Assert.Equal(Stock, orders.Count(o => o is not null)); // 10 buyers got an order
        Assert.Equal(Stock, savedOrders);                       // 10 orders in the database
        Assert.Equal(0, product.AvailableQuantity);             // and no stock left
    }


    // ---------- seeding ----------
    private async Task<(int ProductId, int DeliveryMethodId)> SeedProductAndDeliveryAsync()
    {
        await using var scope = fixture.Services.CreateAsyncScope();
        var db = scope.ServiceProvider.GetRequiredService<StoreContext>();

        var product = new Product
        {
            Name = "Last 10 units",
            Price = 100m,
            Type = "Test",
            Brand = "Test",
            AvailableQuantity = Stock,
            SellerId = "test-seller"
        };

        var delivery = new DeliveryMethod
        {
            ShortName = "TEST",
            DeliveryTime = "1 day",
            Description = "Test delivery",
            Price = 0m
        };

        db.Products.Add(product);
        db.DeliveryMethods.Add(delivery);
        await db.SaveChangesAsync(TestContext.Current.CancellationToken);

        return (product.Id, delivery.Id);
    }

    private async Task<string[]> SeedPaidCartsAsync(int productId, int deliveryMethodId)
    {
        var carts = fixture.Services.GetRequiredService<ShoppingCartCacheService>();
        var ids = new string[Buyers];

        for (var i = 0; i < Buyers; i++)
        {
            ids[i] = $"test-cart-{Guid.NewGuid():N}";

            await carts.SetCartAsync(new ShoppingCart
            {
                Id = ids[i],
                Items =
                [
                    new CartItem
                    {
                        ProductId = productId,
                        ProductName = "Last 10 units",
                        Price = 100m,
                        Quantity = 1,
                        PictureUrl = "",
                        Brand = "Test",
                        Type = "Test"
                    }
                ],
                DeliveryMethodId = deliveryMethodId,
                PaymentStatus = "paid",                  // the state the webhook leaves it in
                PaymentReference = $"test-payment-{i}",  // unique, so the duplicate check doesn't merge buyers
                BillingAddress = new BillingAddress
                {
                    FirstName = "Buyer",
                    LastName = $"{i}",
                    Email = $"buyer-{i}@test.local",
                    PhoneNumber = "01000000000",
                    Country = "EG",
                    City = "Cairo",
                    Street = "Test St"
                }
            });
        }

        return ids;
    }
}
