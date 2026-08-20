namespace Commerce.Core.Entities;

public sealed class SellerProfile : BaseEntity
{
    public required string UserId { get; init; }
    public string BrandName { get; private set; } = string.Empty;

    public static SellerProfile Create(string userId, string brandName)
    {
        if (string.IsNullOrWhiteSpace(brandName))
            throw new ArgumentException("Brand name is required.", nameof(brandName));

        return new SellerProfile { UserId = userId, BrandName = brandName.Trim() };
    }
}
