namespace Commerce.Infrastructure.Configurations;

public class ProductConfigurations : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.Property(p => p.Name)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(p => p.Description)
            .HasMaxLength(2000);

        builder.Property(p => p.Price)
            .HasColumnType("decimal(18,2)");

        builder.Property(p => p.PictureUrl)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(p => p.Type)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.AvailableQuantity)
            .IsRequired();
    }
}
