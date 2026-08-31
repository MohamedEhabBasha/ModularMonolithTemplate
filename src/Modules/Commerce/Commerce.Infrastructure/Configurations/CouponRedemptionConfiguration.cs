using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Configurations;

public class CouponRedemptionConfiguration : IEntityTypeConfiguration<CouponRedemption>
{
    public void Configure(EntityTypeBuilder<CouponRedemption> builder)
    {
        builder.Property(c => c.DiscountAmount).HasColumnType("decimal(18,2)");
        builder.HasIndex(r => new { r.CouponId, r.BuyerEmail }); // fast "has this user already redeemed this" check
        builder.HasOne<Coupon>().WithMany().HasForeignKey(r => r.CouponId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}
