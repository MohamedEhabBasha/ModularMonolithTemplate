namespace Commerce.Infrastructure.Configurations;

public class SellerProfileConfiguration : IEntityTypeConfiguration<SellerProfile>
{
    public void Configure(EntityTypeBuilder<SellerProfile> builder)
    {
        builder.Property(s => s.UserId).IsRequired().HasMaxLength(450); // matches IdentityUser.Id
        builder.HasIndex(s => s.UserId).IsUnique(); // one profile per seller — also your DB-level guard

        builder.Property(s => s.BrandName).IsRequired().HasMaxLength(100);
    }
}
