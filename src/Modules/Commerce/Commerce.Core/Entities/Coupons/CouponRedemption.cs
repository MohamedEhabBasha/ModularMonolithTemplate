namespace Commerce.Core.Entities.Coupons;

public sealed class CouponRedemption : BaseEntity
{
    public int CouponId { get; private set; }
    public string BuyerEmail { get; private set; } = default!; // see the identity note below
    public int OrderId { get; private set; }
    public decimal DiscountAmount { get; private set; } // snapshot — survives even if the Coupon row is gone
    public DateTime RedeemedAt { get; private set; }

    private CouponRedemption() { }

    public static CouponRedemption Create(int couponId, string buyerEmail, int orderId, decimal discountAmount) =>
        new() { CouponId = couponId, BuyerEmail = buyerEmail, OrderId = orderId, DiscountAmount = discountAmount, RedeemedAt = DateTime.UtcNow };
}
