using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;

namespace Commerce.Infrastructure.Services;

public class BuyerProfileProvider : IUserProfileProvider
{
    public string Role => "Buyer";

    public Task<UserProfileDto> GetProfileAsync(UserIdentitySnapshot identity) =>
        Task.FromResult<UserProfileDto>(new UserProfileDto
        {
            Id = identity.Id,
            Email = identity.Email,
            FirstName = identity.FirstName,
            LastName = identity.LastName,
            PictureUrl = identity.PictureUrl,
            Roles = identity.Roles
        });
}
