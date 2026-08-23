using BuildingBlocks.Core.Entities;
using BuildingBlocks.Infrastructure.Seeding;
using Commerce.Core.Entities.Products;
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
        if (!context.SellerProfiles.Any())
        {
            context.SellerProfiles.AddRange(
                SellerProfile.Create(SeedIds.Seller1Id, "PixelPeak Sports"),
                SellerProfile.Create(SeedIds.Seller2Id, "CodeForge Outdoors"),
                SellerProfile.Create(SeedIds.Seller3Id, "ByteTrail Gear")
            );
            await context.SaveChangesAsync();
        }

        if (!context.Products.Any())
        {
            var path = Path.Combine(
                AppContext.BaseDirectory,
                "Data",
                "Seed",
                "Json",
                "products.json");

            var productsData = await File.ReadAllTextAsync(path);

            var products = JsonSerializer.Deserialize<List<ProductSeedDto>>(productsData);

            if (products is null) return;

            foreach (var item in products)
            {
                var product = new Product
                {
                    Name = item.Name,
                    Description = item.Description,
                    Price = item.Price,
                    Type = item.Type,
                    Brand = item.Brand,
                    AvailableQuantity = item.AvailableQuantity,
                    SellerId = item.SellerId,
                    Status = item.Status
                };

                product.AddPhoto(new Photo(item.PictureUrl, PublicId: "null"));

                context.Products.Add(product);
            }

            await context.SaveChangesAsync();
        }

        if (!context.DeliveryMethods.Any())
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
public class ProductSeedDto
{
    public string Name { get; set; } = default!;
    public string Description { get; set; } = default!;
    public decimal Price { get; set; }
    public string PictureUrl { get; set; } = default!;
    public string Type { get; set; } = default!;
    public string Brand { get; set; } = default!;
    public int AvailableQuantity { get; set; }
    public string SellerId { get; set; } = default!;
    public ProductStatus Status { get; set; }
}