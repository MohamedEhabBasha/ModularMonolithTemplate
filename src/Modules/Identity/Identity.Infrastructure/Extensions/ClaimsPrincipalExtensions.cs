using Identity.Application.DTOs.Requests;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Security.Authentication;
using System.Security.Claims;

namespace Identity.Infrastructure.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static async Task<AppUser> GetCurrentUserWithAddressAsync(
    this UserManager<AppUser> userManager,
    ClaimsPrincipal principal,
    bool asNoTracking = false)
    {
        var userId = userManager.GetUserId(principal)
            ?? throw new AuthenticationException("User id claim not found");

        IQueryable<AppUser> query = userManager.Users.Include(x => x.Address);
        if (asNoTracking) query = query.AsNoTracking();

        var user = await query.FirstOrDefaultAsync(x => x.Id == userId);

        return user ?? throw new AuthenticationException("User not found");
    }
}
