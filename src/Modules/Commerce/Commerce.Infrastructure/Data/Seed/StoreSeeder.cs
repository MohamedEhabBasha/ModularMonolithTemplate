using Microsoft.Extensions.DependencyInjection;
using System.Text.Json;

namespace Commerce.Infrastructure.Data.Seed;

public static class StoreSeeder
{
    public static async Task InitializeAsync(IServiceProvider services)
    {
        var context = services.GetRequiredService<StoreContext>();

        await context.Database.MigrateAsync();

        await SeedAsync(context);
    }
    private static async Task SeedAsync(StoreContext context)
    {
        if (!context.Products.Any())
        {
            var path = Path.Combine(
                AppContext.BaseDirectory,
                "Data",
                "Seed",
                "Json",
                "products.json");

            var productsData = await File.ReadAllTextAsync(path);

            var products = JsonSerializer.Deserialize<List<Product>>(productsData);

            if (products is null) return;

            context.Products.AddRange(products);

            await context.SaveChangesAsync();
        }

        if (!context.Products.Any())
        {
            var path = Path.Combine(
                AppContext.BaseDirectory,
                "Data",
                "Seed",
                "Json",
                "delivery.json");

            var deliveryData = await File.ReadAllTextAsync(path);

            var deliveries = JsonSerializer.Deserialize<List<DeliveryMethod>>(deliveryData);

            if (deliveries is null) return;

            context.DeliveryMethods.AddRange(deliveries);

            await context.SaveChangesAsync();
        }
    }
}
