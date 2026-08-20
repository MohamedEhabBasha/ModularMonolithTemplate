using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Infrastructure.Services.Resolvers;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Identity.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddIdentityInfrastructure
    (this IServiceCollection services, IConfiguration configuration)
    {
        services.AddDbContext<IdentityDbContext>(options =>
        {
            options.UseSqlServer(configuration.GetConnectionString("IdentityDb"));
        });

        services.AddScoped<IUserDirectory, UserDirectory>();
        services.AddScoped<UserProfileResolver>();

        return services;
    }
}
