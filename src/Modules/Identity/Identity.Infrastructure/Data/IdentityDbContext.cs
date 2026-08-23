using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Data;

public class IdentityDbContext(DbContextOptions<IdentityDbContext> options) : IdentityDbContext<AppUser>(options)
{
    public DbSet<Address> Addresses { get; set; }
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Address>(a =>
        {
            a.Property(x => x.Line1).HasMaxLength(200);
            a.Property(x => x.Line2).HasMaxLength(200);
            a.Property(x => x.City).HasMaxLength(100);
            a.Property(x => x.State).HasMaxLength(100);
            a.Property(x => x.PostalCode).HasMaxLength(20);
            a.Property(x => x.Country).HasMaxLength(100);
        });

        builder.Entity<AppUser>().OwnsOne(u => u.ProfilePhoto, p =>
        {
            p.Property(x => x.Url).HasColumnName("PictureUrl");
            p.Property(x => x.PublicId).HasColumnName("PicturePublicId");
        });
    }
}
