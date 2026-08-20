using App.API;
using Commerce.Infrastructure;
using Commerce.Infrastructure.Data.Seed;
using Identity.Core.Entities;
using Identity.Infrastructure;
using Identity.Infrastructure.Data.Seed;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

//APP API
builder.Services.AddAPI(builder.Configuration);

// Identity Module
builder.Services
    .AddIdentityInfrastructure(builder.Configuration);

// Commerce Module
builder.Services
    .AddCommerceInfrastructure(builder.Configuration);

var app = builder.Build();

app.UseApiServices();

try
{
    using var scope = app.Services.CreateScope();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

    await IdentitySeeder.InitializeAsync(scope.ServiceProvider, builder.Configuration, userManager);
    await StoreSeeder.InitializeAsync(scope.ServiceProvider);
}
catch (Exception ex)
{
    Console.WriteLine(ex);
    throw;
}

app.Run();
