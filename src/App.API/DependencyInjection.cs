using App.API.Exceptions;
using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Infrastructure.Services.Caching;
using StackExchange.Redis;

namespace App.API;

public static class DependencyInjection
{
    public static IServiceCollection AddAPI
        (this IServiceCollection services, IConfiguration configuration)
    {
        // Add services to the container.

        services.AddControllers();

        services.AddExceptionHandler<CustomExceptionHandler>();
        services.AddProblemDetails();
        services.AddCors();
        services.AddSingleton<IConnectionMultiplexer>(config =>
        {
            var connString = configuration.GetConnectionString("Redis")
                ?? throw new Exception("Cannot get redis connection string");
            var configurationOptions = ConfigurationOptions.Parse(connString, true);
            return ConnectionMultiplexer.Connect(configurationOptions);
        });

        services.AddSingleton(typeof(ICacheService<>), typeof(CacheService<>));

        return services;
    }
    public static WebApplication UseApiServices(this WebApplication app)
    {
        app.UseExceptionHandler();

        app.UseCors(x => x.AllowAnyHeader().AllowAnyMethod().AllowCredentials()
            .WithOrigins("http://localhost:4200", "https://localhost:4200"));

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        return app;
    }
}
