using Commerce.Core.Entities.Coupons;

namespace Commerce.Application.Contracts.Persistence;

public interface ICouponRepository : IGenericRepository<Coupon>
{
    Task<Coupon?> GetByCodeAsync(string code);
    Task<bool> HasUserRedeemedAsync(int couponId, string userId);
    Task<bool> TryIncrementRedemptionAsync(int couponId);
}
