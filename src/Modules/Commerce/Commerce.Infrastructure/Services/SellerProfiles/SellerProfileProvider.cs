using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;
using Commerce.Application.DTOs;

namespace Commerce.Infrastructure.Services.SellerProfiles;

public class SellerProfileProvider(SellerBrandNameCacheService cache) : IUserProfileProvider
{
    public string Role => "Seller";

    public async Task<UserProfileDto> GetProfileAsync(UserIdentitySnapshot identity)
    {
        
        var brandName = await cache.GetAsync(identity.Id);

        return new SellerProfileDto
        {
            Id = identity.Id,
            Email = identity.Email,
            FirstName = identity.FirstName,
            LastName = identity.LastName,
            PictureUrl = identity.PictureUrl,
            Roles = identity.Roles,
            BrandName = brandName
        };
    }
}
