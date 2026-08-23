using BuildingBlocks.Application.Contracts.Services.Users;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Identity.Infrastructure.Services;

// Communication between Identity Module and Other Modules
public class UserDirectory(UserManager<AppUser> userManager) : IUserDirectory
{
    public async Task<Dictionary<string, UserDisplayInfo>> GetDisplayInfoAsync(IEnumerable<string> userIds)
    {
        var ids = userIds.Distinct().ToList();

        return await userManager.Users
            .Where(u => ids.Contains(u.Id))
            .Select(u => new UserDisplayInfo(u.Id, u.FirstName!, u.LastName!, u.ProfilePhoto!.Url))
            .ToDictionaryAsync(u => u.Id);
    }
}
