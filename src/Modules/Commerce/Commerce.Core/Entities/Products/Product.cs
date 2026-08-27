using BuildingBlocks.Core.Exceptions;

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
    public bool IsDeleted { get; private set; }
    public void Approve(string reviewedByUserId)
    {
        Status = ProductStatus.Approved;
        RejectionReason = null;
        ReviewedByUserId = reviewedByUserId;
        ReviewedAt = DateTime.UtcNow;
    }
    public void Reject(string reviewedByUserId, string reason)
    {
        if (string.IsNullOrWhiteSpace(reason))
            throw new DomainException("A rejection reason is required.");

        Status = ProductStatus.Rejected;
        RejectionReason = reason;
        ReviewedByUserId = reviewedByUserId;
        ReviewedAt = DateTime.UtcNow;
    }
    public void Update(string name, string description, decimal price, string type, string brand, int availableQuantity)
    {
        Name = name;
        Description = description;
        Price = price;
        Type = type;
        Brand = brand;
        AvailableQuantity = availableQuantity;

        // Any edit — from Approved or Rejected — sends it back for review.
        Status = ProductStatus.Pending;
        RejectionReason = null;
        ReviewedByUserId = null;
        ReviewedAt = null;
    }
    public void Delete()
    {
        IsDeleted = true;
        AvailableQuantity = 0;
    }
    public void AddPhoto(Photo photo) => _photos.Add(photo);

    public void RemovePhoto(string publicId)
    {
        var photo = _photos.FirstOrDefault(p => p.PublicId == publicId);
        if (photo is not null) _photos.Remove(photo);
    }
}
