using BuildingBlocks.Application.Exceptions;
using Commerce.Application.Contracts.Services.Coupons;
using Commerce.Application.DTOs;
using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Services.Coupons;

public class CouponService(CouponCacheService cache, IStoreUnitOfWork storeUnit) : ICouponService
{
    public async Task<CouponPreviewDto> PreviewAsync(string code, string? buyerEmail, decimal subtotal)
    {
        var rules = await cache.GetRulesByCodeAsync(code) ?? throw new BadRequestException("Invalid coupon code.");

        if (!rules.IsActive) throw new BadRequestException("This coupon is no longer active.");

        var now = DateTime.UtcNow;
        if (now < rules.StartsAt) throw new BadRequestException("This coupon isn't active yet.");

        if (rules.ExpiresAt is { } expiry && now > expiry) throw new BadRequestException("This coupon has expired.");
        
        if (rules.MinimumOrderAmount is { } min && subtotal < min)
            throw new BadRequestException($"This coupon requires a minimum order of {min:C}.");

        if (rules.IsSingleUsePerCustomer && buyerEmail is not null &&
            await storeUnit.Coupons.HasUserRedeemedAsync(rules.Id, buyerEmail))
        {
            throw new BadRequestException("You've already used this coupon.");
        }

        // Live read, deliberately bypassing cache — this is the one value that must be current.
        var coupon = await storeUnit.Coupons.GetByIdAsync(rules.Id) ?? throw new BadRequestException("Invalid coupon code.");
        if (coupon.MaxRedemptions is { } max && coupon.RedemptionCount >= max)
            throw new BadRequestException("This coupon has been fully redeemed.");

        return new CouponPreviewDto(coupon.Id, coupon.Code, coupon.CalculateDiscount(subtotal));
    }

    public async Task<CouponRedemptionResult> TryRedeemAsync(int couponId, string buyerEmail, int orderId, decimal discountAmount)
    {
        var coupon = await storeUnit.Coupons.GetByIdAsync(couponId);
        if (coupon is null)
            return CouponRedemptionResult.InvalidCoupon;

        if (coupon.IsSingleUsePerCustomer && await storeUnit.Coupons.HasUserRedeemedAsync(couponId, buyerEmail))
            return CouponRedemptionResult.AlreadyUsed;

        // Atomic conditional UPDATE, the same pattern as the stock decrement
        if (!await storeUnit.Coupons.TryIncrementRedemptionAsync(couponId))
            return CouponRedemptionResult.FullyRedeemed;

        storeUnit.CouponsRedemptions.Add(CouponRedemption.Create(couponId, buyerEmail, orderId, discountAmount));
        return CouponRedemptionResult.Redeemed;
    }
}
