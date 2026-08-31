using BuildingBlocks.Core.Exceptions;

namespace Commerce.Core.Entities.Coupons;

public sealed class Coupon : BaseEntity
{
    public string Code { get; private set; } = default!;
    public DiscountType DiscountType { get; private set; }
    public decimal DiscountValue { get; private set; }
    public decimal? MinimumOrderAmount { get; private set; }
    public DateTime StartsAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
    public int? MaxRedemptions { get; private set; } // null = unlimited
    public int RedemptionCount { get; private set; }
    public bool IsSingleUsePerCustomer { get; private set; }
    public bool IsActive { get; private set; }

    private Coupon() { } // EF

    public static Coupon Create(string code, DiscountType type, decimal value, decimal? minimumOrderAmount,
        DateTime startsAt, DateTime? expiresAt, int? maxRedemptions, bool singleUsePerCustomer)
    {
        if (string.IsNullOrWhiteSpace(code)) throw new DomainException("Coupon code is required.");
        if (type == DiscountType.Percentage && (value <= 0 || value > 100))
            throw new DomainException("Percentage discount must be between 1 and 100.");
        if (type == DiscountType.FixedAmount && value <= 0)
            throw new DomainException("Fixed discount must be greater than zero.");

        return new Coupon
        {
            Code = code.Trim().ToUpperInvariant(),
            DiscountType = type,
            DiscountValue = value,
            MinimumOrderAmount = minimumOrderAmount,
            StartsAt = startsAt,
            ExpiresAt = expiresAt,
            MaxRedemptions = maxRedemptions,
            IsSingleUsePerCustomer = singleUsePerCustomer,
            IsActive = true
        };
    }

    public void EnsureIsValidFor(decimal subtotal, DateTime now)
    {
        if (!IsActive) throw new DomainException("This coupon is no longer active.");
        if (now < StartsAt) throw new DomainException("This coupon isn't active yet.");
        if (ExpiresAt is { } expiry && now > expiry) throw new DomainException("This coupon has expired.");
        if (MinimumOrderAmount is { } min && subtotal < min)
            throw new DomainException($"This coupon requires a minimum order of {min:C}.");
    }

    // Never lets a coupon discount a cart into negative territory.
    public decimal CalculateDiscount(decimal subtotal)
    {
        var discount = DiscountType == DiscountType.Percentage ? subtotal * (DiscountValue / 100m) : DiscountValue;
        return Math.Min(discount, subtotal);
    }
}
