using BuildingBlocks.Core.Entities;
using BuildingBlocks.Infrastructure.Seeding;
using Identity.Core.Constants;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Infrastructure.Data.Seed;

public static class IdentitySeeder
{
    public static async Task InitializeAsync(IServiceProvider services, IConfiguration configuration, UserManager<AppUser> userManager)
    {
        var context = services.GetRequiredService<IdentityDbContext>();

        await context.Database.MigrateAsync();

        await SeedAsync(services, configuration);
        await SeedDevelopmentSellersAsync(userManager);
    }
    private static async Task SeedAsync(IServiceProvider services, IConfiguration configuration)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();

        foreach (var roleName in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(roleName))
            {
                var result = await roleManager.CreateAsync(new IdentityRole(roleName));
                if (!result.Succeeded)
                    throw new Exception($"Failed to seed role '{roleName}': " +
                        string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }

        var adminEmail = configuration["Seed:AdminEmail"];
        var adminPassword = configuration["Seed:AdminPassword"];
        if (string.IsNullOrWhiteSpace(adminEmail) || string.IsNullOrWhiteSpace(adminPassword))
            return;

        var userManager = services.GetRequiredService<UserManager<AppUser>>();
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new AppUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true };
            var result = await userManager.CreateAsync(admin, adminPassword);
            if (result.Succeeded)
                await userManager.AddToRoleAsync(admin, Roles.Admin);
        }
    }

    private static async Task SeedDevelopmentSellersAsync(UserManager<AppUser> userManager)
    {
        await SeedSellerAsync(userManager, SeedIds.Seller1Id, "seller1@example.com", "Alice", "Nguyen",
            "https://i.pravatar.cc/150?img=47");
        await SeedSellerAsync(userManager, SeedIds.Seller2Id, "seller2@example.com", "Marcus", "Reed",
            "https://i.pravatar.cc/150?img=12");
        await SeedSellerAsync(userManager, SeedIds.Seller3Id, "seller3@example.com", "Priya", "Sharma",
            "https://i.pravatar.cc/150?img=32");
    }
    private static async Task SeedSellerAsync(
    UserManager<AppUser> userManager, string id, string email, string firstName, string lastName, string pictureUrl)
    {
        if (await userManager.FindByIdAsync(id) is not null) return;

        var user = new AppUser
        {
            Id = id, // fixed, so Commerce's seed data can reference the same seller reliably
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            FirstName = firstName,
            LastName = lastName,
            ProfilePhoto = pictureUrl is not null ? new Photo(pictureUrl, PublicId: null) : null
        };

        var result = await userManager.CreateAsync(user, "Seller@123"); // dev fixture only — never reuse this password anywhere real
        if (result.Succeeded)
            await userManager.AddToRoleAsync(user, Roles.Seller);
    }

}
