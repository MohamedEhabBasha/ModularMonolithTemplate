using BuildingBlocks.Application.Contracts.Services;
using Commerce.Infrastructure.Data;

namespace Commerce.Infrastructure.Services.SellerProfiles;

public class SellerBrandNameCacheService(ICacheService<string> cache, StoreContext context)
{
    private static string Key(string sellerId) => $"seller-brand:{sellerId}";
    private static readonly TimeSpan CacheDuration = TimeSpan.FromDays(7);

    public async Task<string> GetAsync(string sellerId)
    {
        var result = await GetManyAsync([sellerId]);
        return result.GetValueOrDefault(sellerId, string.Empty);
    }

    public async Task<Dictionary<string, string>> GetManyAsync(IEnumerable<string> sellerIds)
    {
        var ids = sellerIds.Distinct().ToList();
        var result = new Dictionary<string, string>();
        var missing = new List<string>();

        foreach (var id in ids)
        {
            var cached = await cache.GetAsync(Key(id));
            if (cached is not null) result[id] = cached;
            else missing.Add(id);
        }

        if (missing.Count > 0)
        {
            var brandNames = await context.SellerProfiles
                .AsNoTracking()
                .Where(p => missing.Contains(p.UserId))
                .ToDictionaryAsync(p => p.UserId, p => p.BrandName);

            foreach (var id in missing)
            {
                var brandName = brandNames.GetValueOrDefault(id, string.Empty);
                result[id] = brandName;
                await cache.SetAsync(Key(id), brandName, CacheDuration);
            }
        }

        return result;
    }

    public Task<string?> SetAsync(SellerProfile seller) =>
        cache.SetAsync(Key(seller.UserId), seller.BrandName, CacheDuration);

    public Task<bool> DeleteAsync(string sellerId) =>
        cache.DeleteAsync(Key(sellerId));
}
