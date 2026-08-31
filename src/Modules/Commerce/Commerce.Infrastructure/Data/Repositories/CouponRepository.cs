using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Data.Repositories;

public class CouponRepository(StoreContext context) : GenericRepository<Coupon>(context), ICouponRepository
{
    public Task<Coupon?> GetByCodeAsync(string code) =>
        context.Coupons.FirstOrDefaultAsync(c => c.Code == code);

    public Task<bool> HasUserRedeemedAsync(int couponId, string buyerEmail) =>
        context.CouponRedemptions.AnyAsync(r => r.CouponId == couponId && r.BuyerEmail == buyerEmail);

    // The atomic increment: succeeds only if capacity remains, in one round trip, no read-then-write race window.
    public async Task<bool> TryIncrementRedemptionAsync(int couponId)
    {
        var rows = await context.Coupons
            .Where(c => c.Id == couponId && (c.MaxRedemptions == null || c.RedemptionCount < c.MaxRedemptions))
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.RedemptionCount, c => c.RedemptionCount + 1));
        return rows == 1;
    }
}
