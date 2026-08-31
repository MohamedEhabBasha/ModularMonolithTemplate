using BuildingBlocks.Application.Contracts.Services;

namespace Commerce.Infrastructure.Services.Coupons;

public class CouponCacheService(ICacheService<CachedCouponRules> cache, IStoreUnitOfWork storeUnit)
{
    private static string CacheKey(string code) => $"coupon:{code}";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(10);

    public async Task<CachedCouponRules?> GetRulesByCodeAsync(string code)
    {
        var normalized = code.Trim().ToUpperInvariant();
        var cached = await cache.GetAsync(CacheKey(normalized));
        if (cached is not null) return cached;

        var coupon = await storeUnit.Coupons.GetByCodeAsync(normalized);
        if (coupon is null) return null;

        var rules = new CachedCouponRules(coupon.Id, coupon.Code, coupon.DiscountType, coupon.DiscountValue,
            coupon.MinimumOrderAmount, coupon.StartsAt, coupon.ExpiresAt, coupon.IsActive, coupon.IsSingleUsePerCustomer, coupon.MaxRedemptions);

        await cache.SetAsync(CacheKey(normalized), rules, CacheDuration);
        return rules;
    }

    public Task InvalidateAsync(string code) => cache.DeleteAsync(CacheKey(code.Trim().ToUpperInvariant()));
}
