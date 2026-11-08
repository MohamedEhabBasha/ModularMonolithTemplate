namespace Commerce.Application.Contracts.Services.Coupons;

public enum CouponRedemptionResult
{
    Redeemed,
    InvalidCoupon,
    AlreadyUsed,
    FullyRedeemed
}
