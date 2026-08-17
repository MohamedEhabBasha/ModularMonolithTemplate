using App.API.Exceptions;
using App.API.Modules.Commerce.Realtime;
using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Infrastructure.Services.Caching;
using Commerce.Application.Contracts.Notifications;
using Identity.Core.Entities;
using Identity.Infrastructure.Data;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Identity;
using StackExchange.Redis;

namespace App.API;

public static class DependencyInjection
{
    public const string CorsPolicyName = "AngularClient";
    public static IServiceCollection AddAPI
        (this IServiceCollection services, IConfiguration configuration)
    {
        // Add services to the container.

        services.AddControllers();

        services.AddHttpClient();

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

        /* Authentication */

        services.AddIdentity<AppUser, IdentityRole>(options =>
        {
            options.Password.RequiredLength = 8;
            options.Password.RequireNonAlphanumeric = true;
            options.User.RequireUniqueEmail = true;
        })
            .AddEntityFrameworkStores<IdentityDbContext>()
            .AddDefaultTokenProviders();

        services.ConfigureApplicationCookie(options =>
        {
            options.Cookie.Name = "Identity.Auth";
            options.Cookie.HttpOnly = true;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
            options.ExpireTimeSpan = TimeSpan.FromMinutes(60);
            options.SlidingExpiration = true;

            options.Events.OnRedirectToLogin = ctx =>
            {
                ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
                return Task.CompletedTask;
            };
            options.Events.OnRedirectToAccessDenied = ctx =>
            {
                ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
                return Task.CompletedTask;
            };
        });

        services.AddAntiforgery(options =>
        {
            options.HeaderName = "X-XSRF-TOKEN";
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.Strict;
        });

        services.AddAuthorization();

        services.AddCors(options =>
        {
            options.AddPolicy(CorsPolicyName, policy =>
            {
                // Credentialed (cookie) requests can never use AllowAnyOrigin — must be exact.
                policy.WithOrigins(configuration["ClientApp:Origin"] ?? "https://localhost:4200")
                      .AllowAnyHeader()
                      .AllowAnyMethod()
                      .AllowCredentials();
            });
        });

        services.AddSignalR();
        services.AddScoped<ICommerceNotifier, SignalRCommerceNotifier>(); //Commerce

        return services;
    }
    public static WebApplication UseApiServices(this WebApplication app)
    {
        app.UseExceptionHandler();

        app.UseHttpsRedirection();

        app.UseCors(CorsPolicyName);

        app.UseAuthentication();
        app.UseAuthorization();

        // Infra endpoint: Angular calls this once on bootstrap to seed the readable
        // XSRF-TOKEN cookie before any POST/PUT/DELETE/PATCH goes out.
        app.MapGet("/api/antiforgery/token", (IAntiforgery antiforgery, HttpContext http) =>
        {
            var tokens = antiforgery.GetAndStoreTokens(http); // sets the HttpOnly cookie-token cookie

            http.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
            {
                HttpOnly = false, // Angular (or you, in Postman) needs to read this one
                Secure = true,
                SameSite = SameSiteMode.Strict
            });

            return Results.Ok();
        }).AllowAnonymous();

        app.MapControllers();
        app.MapHub<CommerceHub>("/api/hubs/commerce");

        return app;
    }
}
