using Commerce.Application.DTOs;

namespace Commerce.Application.Contracts.Services.Coupons;

public interface ICouponService
{
    Task<CouponPreviewDto> PreviewAsync(string code, string? buyerEmail, decimal subtotal);

    /// <summary>
    /// Records a redemption. Must run inside the caller's transaction; does not save.
    /// </summary>
    Task<CouponRedemptionResult> TryRedeemAsync(int couponId, string buyerEmail, int orderId, decimal discountAmount);
}
