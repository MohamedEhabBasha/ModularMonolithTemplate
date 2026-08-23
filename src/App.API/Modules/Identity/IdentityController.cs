using Identity.Application.DTOs.Requests;
using Identity.Application.DTOs.Responses;
using Identity.Core.Constants;
using Identity.Core.Entities;
using Identity.Infrastructure.Data;
using Identity.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Identity;

//[ValidateAntiforgery]
public class IdentityController(UserManager<AppUser> _userManager, 
    SignInManager<AppUser> _signInManager, IdentityDbContext context) : BaseController
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto registerDto)
    {
        var user = new AppUser
        {
            UserName = registerDto.Email,
            Email = registerDto.Email,
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName
        };

        var result = await _userManager.CreateAsync(user, registerDto.Password);

        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                if (error.Code == "DuplicateUserName")
                    continue;

                ModelState.AddModelError(error.Code, error.Description);
            }

            return ValidationProblem(ModelState);
        }

        var role = registerDto.AccountType == AccountType.Seller ? Roles.Seller : Roles.Buyer;
        var roleResult = await _userManager.AddToRoleAsync(user, role);

        if (!roleResult.Succeeded)
        {
            // Don't leave a role-less user behind — everything downstream assumes a role exists
            await _userManager.DeleteAsync(user);
            ModelState.AddModelError(string.Empty, "Unable to complete registration. Please try again.");
            return ValidationProblem(ModelState);
        }

        await _signInManager.SignInAsync(user, false);

        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto loginDto)
    {
        // On success this issues the HttpOnly/Secure/SameSite=Strict cookie
        var result = await _signInManager.PasswordSignInAsync(
            loginDto.Email, loginDto.Password, isPersistent: false, lockoutOnFailure: true);

        if (result.IsLockedOut)
            return StatusCode(StatusCodes.Status423Locked, new { error = "Account locked. Try again later." });

        return result.Succeeded ? 
            Ok() 
            : 
            Unauthorized(new ProblemDetails
            {
                Title = "Authentication failed",
                Detail = "Invalid email or password.",
                Status = StatusCodes.Status401Unauthorized
            });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync(); // clears the auth cookie server-side
        return Ok();
    }

    [HttpGet("user-info")]
    public async Task<ActionResult<UserInfoResponseDto>> GetUserInfo()
    {
        if (User.Identity?.IsAuthenticated != true) return NoContent();

        var user = await _signInManager.UserManager
            .GetCurrentUserWithAddressAsync(User, asNoTracking: true);

        var roles = await _signInManager.UserManager.GetRolesAsync(user);

        return Ok(new UserInfoResponseDto(
            user.Id, user.Email!, user.FirstName!, user.LastName!,
            user.Address?.ToDto(), user.PhoneNumber, roles));
    }

    // Deliberately anonymous: the SPA hits this on bootstrap to decide app-shell
    // vs. login screen, without triggering a 401/redirect on first load.
    [HttpGet("user-state")]
    [AllowAnonymous]
    public IActionResult GetUserState()
    {
        return Ok(new { IsAuthenticated = User.Identity?.IsAuthenticated ?? false });
    }

    [Authorize]
    [HttpPost("address")]
    public async Task<ActionResult<AddressDto>> CreateOrUpdateAddress(AddressDto addressDto)
    {
        var user = await _signInManager.UserManager.GetCurrentUserWithAddressAsync(User);

        if (user.Address == null)
            user.Address = addressDto.ToEntity();
        else
            user.Address.UpdateFromDto(addressDto);

        await context.SaveChangesAsync();

        return Ok(user.Address.ToDto());
    }

    [Authorize]
    [HttpPut("basic-info")]
    public async Task<IActionResult> UpdateBasicInfo(UpdateBasicInfoDto dto)
    {
        var user = await _signInManager.UserManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        // user.Bio = dto.Bio;

        var result = await _signInManager.UserManager.UpdateAsync(user);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return NoContent();
    }

    [Authorize]
    [HttpPut("phone-number")]
    public async Task<IActionResult> UpdatePhoneNumber(PhoneNumberDto request)
    {
        var user = await _signInManager.UserManager.GetUserAsync(User);
        if (user is null) return Unauthorized();

        var result = await _signInManager.UserManager.SetPhoneNumberAsync(user, request.PhoneNumber);
        if (!result.Succeeded)
            throw new BadRequestException(string.Join(", ", result.Errors.Select(e => e.Description)));

        return Ok();
    }
}
