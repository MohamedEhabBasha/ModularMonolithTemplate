using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;
using BuildingBlocks.Core.Entities;
using BuildingBlocks.Infrastructure.Services.Resolvers;
using Commerce.Application.DTOs;
using Identity.Core.Constants;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Identity;

public class ProfileController
    (
        UserManager<AppUser> userManager, 
        UserProfileResolver profileResolver, 
        ISellerProfileUpdater sellerProfileUpdater,
        IPhotoService photoService
    ) 
    : BaseController
{
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserProfileDto>> GetMyProfile()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var roles = await userManager.GetRolesAsync(user);
        var identity = new 
            UserIdentitySnapshot
            (
                user.Id, 
                user.Email!,
                user.FirstName!, 
                user.LastName!, 
                user.ProfilePhoto?.Url, 
                roles
            );

        return Ok(await profileResolver.ResolveAsync(identity));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserProfileDto>> GetSellerProfile(string id)
    {
        var user = await userManager.FindByIdAsync(id);
        if (user is null) return NotFound();

        var roles = await userManager.GetRolesAsync(user);
        if (!roles.Contains(Roles.Seller)) return NotFound(); // buyers have no public profile page

        var identity = new UserIdentitySnapshot(user.Id, user.Email!, user.FirstName!, user.LastName!, user.ProfilePhoto?.Url, roles);

        return Ok(await profileResolver.ResolveAsync(identity));
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpPut("me/brand-name")]
    public async Task<IActionResult> UpdateBrandName(UpdateBrandNameDto dto)
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        await sellerProfileUpdater.UpdateBrandNameAsync(user.Id, dto.BrandName);
        return NoContent();
    }

    [Authorize]
    [HttpPost("photo")]
    public async Task<ActionResult<PhotoDto>> AddProfilePhoto(IFormFile file)
    {
        if (file.Length == 0)
            throw new BadRequestException("File is required.");

        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        // AppUser has exactly one photo slot — adding always replaces
        if (user.ProfilePhoto?.PublicId is not null)
            await photoService.DeletePhotoAsync(user.ProfilePhoto.PublicId);

        var uploadResult = await photoService.AddPhotoAsync(file);
        if (uploadResult.Error is not null)
            throw new BadRequestException(uploadResult.Error.Message);

        user.ProfilePhoto = new Photo(uploadResult.SecureUrl.AbsoluteUri, uploadResult.PublicId);

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return Ok(new PhotoDto(user.ProfilePhoto.Url));
    }

    [Authorize]
    [HttpDelete("photo")]
    public async Task<IActionResult> DeleteProfilePhoto()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        if (user.ProfilePhoto is null) return NoContent(); // already no photo — idempotent, not an error

        if (user.ProfilePhoto.PublicId is not null)
            await photoService.DeletePhotoAsync(user.ProfilePhoto.PublicId);

        user.ProfilePhoto = null;

        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return NoContent();
    }
}
