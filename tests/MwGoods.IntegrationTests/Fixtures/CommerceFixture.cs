using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Infrastructure.Services.Caching;
using Commerce.Infrastructure;
using Commerce.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using Testcontainers.MsSql;
using Testcontainers.Redis;


namespace MwGoods.IntegrationTests.Fixtures;

/// <summary>
/// Throwaway SQL Server + Redis, plus your real Commerce services wired to them.
/// </summary>
public sealed class CommerceFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _sql = 
        new MsSqlBuilder("mcr.microsoft.com/mssql/server:2022-latest")
        .Build();

    private readonly RedisContainer _redis = 
        new RedisBuilder("redis:7-alpine")
        .Build();

    private ServiceProvider? _services;

    public IServiceProvider Services => _services!;

    public async ValueTask InitializeAsync()
    {
        await Task.WhenAll(_sql.StartAsync(), _redis.StartAsync());

        var sqlConnectionString = new SqlConnectionStringBuilder(_sql.GetConnectionString())
        {
            InitialCatalog = "MwGoodsTests"
        }.ConnectionString;

        // Same key AddCommerceInfrastructure reads, but pointing at the container
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:CommerceDb"] = sqlConnectionString
            })
            .Build();

        var services = new ServiceCollection();
        services.AddSingleton<IConfiguration>(configuration);
        services.AddLogging();

        // The same two Redis registrations your API makes, but pointing at the container
        services.AddSingleton<IConnectionMultiplexer>(_ =>
            ConnectionMultiplexer.Connect(_redis.GetConnectionString()));
        services.AddSingleton(typeof(ICacheService<>), typeof(CacheService<>));

        // Your real Commerce registrations: repositories, unit of work, OrderService...
        services.AddCommerceInfrastructure(configuration);

        _services = services.BuildServiceProvider();

        await using var scope = _services.CreateAsyncScope();
        await scope.ServiceProvider.GetRequiredService<StoreContext>().Database.MigrateAsync();
    }

    public async ValueTask DisposeAsync()
    {
        if (_services is not null) await _services.DisposeAsync();
        await _sql.DisposeAsync();
        await _redis.DisposeAsync();
    }
}
