using BuildingBlocks.Application.Contracts.Services;
using StackExchange.Redis;
using System.Text.Json;

namespace BuildingBlocks.Infrastructure.Services.Caching;

public class CacheService<T>(IConnectionMultiplexer redis) : ICacheService<T> where T : class
{
    private readonly IDatabase _database = redis.GetDatabase();
    private static readonly TimeSpan DefaultExpiry = TimeSpan.FromDays(10);
    public async Task<bool> DeleteAsync(string key)
    {
        return await _database.KeyDeleteAsync(key);
    }

    public async Task<T?> GetAsync(string key)
    {
        var data = await _database.StringGetAsync(key);

        return !data.IsNullOrEmpty ? JsonSerializer.Deserialize<T>((byte[]) data!) : null;
    }

    public async Task<T?> SetAsync(string key, T item, TimeSpan? expiry = null)
    {
        var created = await _database.StringSetAsync(
            key,
            JsonSerializer.Serialize(item),
            expiry ?? DefaultExpiry);

        if (!created) return null;

        return await GetAsync(key);
    }
}
