using BuildingBlocks.Application.Contracts.Services.Users;
using Commerce.Application.DTOs;

namespace Commerce.Infrastructure.Services.SellerProfiles;

public class SellerDisplayResolver(SellerBrandNameCacheService cache, IUserDirectory userDirectory)
{
    public async Task<Dictionary<string, SellerDisplayDto>> GetManyAsync(IEnumerable<string> sellerIds)
    {
        var ids = sellerIds.Distinct().ToList();

        var brandNames = await cache.GetManyAsync(ids);

        var displayInfo = await userDirectory.GetDisplayInfoAsync(ids);

        return ids.ToDictionary(id => id, id =>
        {
            displayInfo.TryGetValue(id, out var info);
            return new SellerDisplayDto(
                id, brandNames.GetValueOrDefault(id, string.Empty),
                info is null ? string.Empty : $"{info.FirstName} {info.LastName}".Trim(),
                info?.PictureUrl);
        });
    }
}
