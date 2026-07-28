namespace App.API;

public static class DependencyInjection
{
    public static IServiceCollection AddAPI
        (this IServiceCollection services, IConfiguration configuration)
    {
        // Add services to the container.

        services.AddControllers();

        return services;
    }
}
