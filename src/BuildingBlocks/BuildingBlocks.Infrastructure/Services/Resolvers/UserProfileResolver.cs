using BuildingBlocks.Application.Contracts.Services.Users;
using BuildingBlocks.Application.Dtos;
using StackExchange.Redis;

namespace BuildingBlocks.Infrastructure.Services.Resolvers;

public class UserProfileResolver(IEnumerable<IUserProfileProvider> providers)
{
    private readonly Dictionary<string, IUserProfileProvider> _providersByRole =
        providers.ToDictionary(p => p.Role, StringComparer.OrdinalIgnoreCase);

    public Task<UserProfileDto> ResolveAsync(UserIdentitySnapshot identity)
    {
        var role = ResolvePrimaryRole(identity.Roles);

        if (!_providersByRole.TryGetValue(role, out var provider))
            throw new InvalidOperationException($"No profile provider registered for role '{role}'.");

        return provider.GetProfileAsync(identity);
    }

    // A user can hold more than one role (buyer + seller). Admin > Seller > Buyer
    // picks the most specific profile to render for "my profile".
    private static string ResolvePrimaryRole(IList<string> roles) =>
        roles.Contains("Admin", StringComparer.OrdinalIgnoreCase) ? "Admin"
        : roles.Contains("Seller", StringComparer.OrdinalIgnoreCase) ? "Seller"
        : "Buyer";
}
