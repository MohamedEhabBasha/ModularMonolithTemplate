using Commerce.Infrastructure.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Testcontainers.MsSql;

namespace MwGoods.IntegrationTests.Fixtures;

public sealed class SqlServerFixture : IAsyncLifetime
{
    private readonly MsSqlContainer _sql = new MsSqlBuilder(
        "mcr.microsoft.com/mssql/server:2022-latest")
        .Build();


    // The container's connection string points at the "master" system database.
    // We switch to our own database name so our tables don't land in master.
    public string ConnectionString =>
        new SqlConnectionStringBuilder(_sql.GetConnectionString())
        {
            InitialCatalog = "MwGoodsTests"
        }.ConnectionString;


    // Every call returns a NEW DbContext, the same as a new HTTP request would get.
    public StoreContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<StoreContext>()
            .UseSqlServer(ConnectionString)
            .Options;

        return new StoreContext(options);
    }

    // Runs ONCE before the first test in the class
    public async ValueTask InitializeAsync()
    {
        await _sql.StartAsync();

        // Creates the MwGoodsTests database and applies all your migrations
        await using var db = CreateDbContext();
        await db.Database.MigrateAsync();
    }

    // Runs ONCE after the last test in the class
    public ValueTask DisposeAsync() => _sql.DisposeAsync();
}
