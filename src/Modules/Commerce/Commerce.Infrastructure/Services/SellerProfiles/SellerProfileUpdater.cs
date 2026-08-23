using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Application.Exceptions;
using Commerce.Application.Specifications.Sellers;

namespace Commerce.Infrastructure.Services.SellerProfiles;

public class SellerProfileUpdater(IStoreUnitOfWork storeUnit, SellerBrandNameCacheService cache)
    : ISellerProfileUpdater
{
    public async Task UpdateBrandNameAsync(string sellerId, string brandName)
    {
        var spec = new SellerProfileBySellerId(sellerId);

        var profile = await storeUnit.SellerProfiles.GetEntityWithSpec(spec)
            ?? throw new NotFoundException("Seller profile not found.");

        profile.Rename(brandName);
        await storeUnit.CommitAsync();

        await cache.DeleteAsync(sellerId);
    }
}
