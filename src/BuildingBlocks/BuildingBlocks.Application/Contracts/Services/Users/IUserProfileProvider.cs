using BuildingBlocks.Application.Dtos;

namespace BuildingBlocks.Application.Contracts.Services.Users;

public record UserIdentitySnapshot
(
    string Id,
    string Email,
    string FirstName,
    string LastName,
    string? PictureUrl,
    IList<string> Roles
);

public interface IUserProfileProvider
{
    string Role { get; }
    Task<UserProfileDto> GetProfileAsync(UserIdentitySnapshot identity);
}
