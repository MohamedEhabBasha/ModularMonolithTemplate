namespace BuildingBlocks.Application.Contracts.Services;

public interface ICacheService<T> where T : class
{
    Task<T?> GetAsync(string key);
    Task<T?> SetAsync(string key, T item, TimeSpan? expiry = null);
    Task<bool> DeleteAsync(string key);
}
