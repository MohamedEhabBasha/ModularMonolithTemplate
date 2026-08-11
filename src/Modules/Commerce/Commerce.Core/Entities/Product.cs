namespace Commerce.Core.Entities;

public sealed class Product : BaseEntity
{
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public required string PictureUrl { get; set; }
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int AvailableQuantity { get; set; }
}
