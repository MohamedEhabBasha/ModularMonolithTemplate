using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Data.Repositories;

public class CouponRedemptionRepository(StoreContext context) : GenericRepository<CouponRedemption>(context), ICouponRedemptionRepository
{
}
