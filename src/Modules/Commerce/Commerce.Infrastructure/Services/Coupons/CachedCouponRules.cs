using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Services.Coupons;

public record CachedCouponRules
(
    int Id, 
    string Code,
    DiscountType DiscountType, 
    decimal DiscountValue,
    decimal? MinimumOrderAmount, 
    DateTime StartsAt, 
    DateTime? ExpiresAt, 
    bool IsActive,
    bool IsSingleUsePerCustomer, 
    int? MaxRedemptions
); // deliberately no RedemptionCount

