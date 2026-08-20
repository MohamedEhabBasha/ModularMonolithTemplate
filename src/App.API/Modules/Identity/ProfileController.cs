using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;
using BuildingBlocks.Infrastructure.Services.Resolvers;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Identity;

public class ProfileController(UserManager<AppUser> userManager, UserProfileResolver profileResolver) : BaseController
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        var identity = new UserIdentitySnapshot(user.Id, user.Email!, user.FirstName!, user.LastName!, user.PictureUrl, roles);

        return Ok(await profileResolver.ResolveAsync(identity));
    }
}
