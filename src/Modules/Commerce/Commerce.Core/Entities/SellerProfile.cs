namespace Commerce.Core.Entities;

public sealed class SellerProfile : BaseEntity
{
    public required string UserId { get; init; }
    public string BrandName { get; private set; } = string.Empty;
    public DateTimeOffset? BrandNameChangedAt { get; private set; }

    public static SellerProfile Create(string userId, string brandName)
    {
        if (string.IsNullOrWhiteSpace(brandName))
            throw new ArgumentException("Brand name is required.", nameof(brandName));

        return new SellerProfile { UserId = userId, BrandName = brandName.Trim() };
    }
    public void Rename(string newBrandName)
    {
        if (BrandNameChangedAt is { } last && DateTimeOffset.UtcNow - last < TimeSpan.FromDays(30))
            throw new Exception("Brand name can only be changed once every 30 days.");

        BrandName = newBrandName;
        BrandNameChangedAt = DateTimeOffset.UtcNow;
    }
}
