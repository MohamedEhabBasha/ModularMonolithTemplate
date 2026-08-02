using App.API.Exceptions;

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
