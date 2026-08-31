using Commerce.Application.DTOs;

namespace Commerce.Application.Contracts.Services.Coupons;

public interface ICouponService
{
    Task<CouponPreviewDto> PreviewAsync(string code, string? buyerEmail, decimal subtotal);
    Task RedeemAsync(int couponId, string buyerEmail, int orderId, decimal discountAmount);
}
