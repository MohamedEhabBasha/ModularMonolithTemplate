using Commerce.Core.Entities.Products;

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

        builder.OwnsMany(p => p.Photos, photo =>
        {
            photo.ToTable("ProductPhotos");
            photo.WithOwner().HasForeignKey("ProductId");
            photo.Property<int>("Id");
            photo.HasKey("Id");
            photo.Property(p => p.Url).IsRequired();
            photo.Property(p => p.PublicId).IsRequired();
        });

        builder.Navigation(p => p.Photos)
            .HasField("_photos")
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(p => p.Type)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.Brand)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(p => p.AvailableQuantity)
            .IsRequired();

        builder.Property(p => p.SellerId).IsRequired().HasMaxLength(450); // matches IdentityUser.Id
        builder.HasIndex(p => p.SellerId); // seller's own product list

        builder.Property(p => p.Status)
            .IsRequired()
            .HasConversion<string>()   // readable in the DB — "Pending" not "0"
            .HasMaxLength(20)
            .HasDefaultValue(ProductStatus.Pending);

        builder.HasIndex(p => new { p.Status, p.CreatedAt }); // admin queue: pending items, oldest first

        builder.Property(p => p.RejectionReason).HasMaxLength(500);
    }
}
