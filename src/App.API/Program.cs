using App.API;
using Commerce.Infrastructure;
using Commerce.Infrastructure.Data.Seed;

var builder = WebApplication.CreateBuilder(args);

//APP API
builder.Services.AddAPI(builder.Configuration);

// Commerce Module
builder.Services
    .AddCommerceInfrastructure(builder.Configuration);

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseAuthorization();

app.MapControllers();

try
{
    using var scope = app.Services.CreateScope();

    await StoreSeeder.InitializeAsync(scope.ServiceProvider);
}
catch (Exception ex)
{
    Console.WriteLine(ex);
    throw;
}

app.Run();
