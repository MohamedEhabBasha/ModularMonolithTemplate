using Commerce.Infrastructure.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Commerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCommerceInfrastructure
        (this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CommerceDb");

        services.AddDbContext<StoreContext>(opt =>
        {
            opt.UseSqlServer(connectionString);
        });

        return services;
    }
}
