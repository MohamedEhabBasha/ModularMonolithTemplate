namespace Commerce.Core.Entities.Products;

public sealed class Product : BaseEntity
{
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    private readonly List<Photo> _photos = [];
    public IReadOnlyList<Photo> Photos => _photos.AsReadOnly();
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int AvailableQuantity { get; set; }

    public required string SellerId { get; set; }        // AppUser.Id — soft reference, no navigation
    public ProductStatus Status { get; set; } = ProductStatus.Pending;
    public string? RejectionReason { get; set; }
    public string? ReviewedByUserId { get; set; }
    public DateTime? ReviewedAt { get; set; }

    public void AddPhoto(Photo photo)
    {
        _photos.Add(photo);
    }

    public void RemovePhoto(string publicId)
    {
        var photo = _photos.FirstOrDefault(p => p.PublicId == publicId);
        if (photo is not null)
            _photos.Remove(photo);
    }
}
