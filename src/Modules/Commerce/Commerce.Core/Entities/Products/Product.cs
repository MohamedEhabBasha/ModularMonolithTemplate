namespace Commerce.Core.Entities.Products;

public sealed class Product : BaseEntity
{
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public required string PictureUrl { get; set; }
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int AvailableQuantity { get; set; }

    public required string SellerId { get; set; }        // AppUser.Id — soft reference, no navigation
    public ProductStatus Status { get; set; } = ProductStatus.Pending;
    public string? RejectionReason { get; set; }
    public string? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }
}
