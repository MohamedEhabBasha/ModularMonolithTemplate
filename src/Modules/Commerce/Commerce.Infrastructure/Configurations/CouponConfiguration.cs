using Commerce.Core.Entities.Coupons;

namespace Commerce.Infrastructure.Configurations;

public class CouponConfiguration : IEntityTypeConfiguration<Coupon>
{
    public void Configure(EntityTypeBuilder<Coupon> builder)
    {
        builder.Property(c => c.Code).HasMaxLength(30).IsRequired();
        builder.HasIndex(c => c.Code).IsUnique();
        builder.Property(c => c.DiscountValue).HasColumnType("decimal(18,2)");
        builder.Property(c => c.MinimumOrderAmount).HasColumnType("decimal(18,2)");
    }
}
