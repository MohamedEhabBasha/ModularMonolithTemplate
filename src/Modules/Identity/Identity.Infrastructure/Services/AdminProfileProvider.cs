using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;
using Identity.Core.Constants;

namespace Identity.Infrastructure.Services;

public class AdminProfileProvider : IUserProfileProvider
{
    public string Role => Roles.Admin;

    public Task<UserProfileDto> GetProfileAsync(UserIdentitySnapshot identity) =>
        Task.FromResult(new UserProfileDto
        {
            Id = identity.Id,
            Email = identity.Email,
            FirstName = identity.FirstName,
            LastName = identity.LastName,
            PictureUrl = identity.PictureUrl,
            Roles = identity.Roles
        });
}
