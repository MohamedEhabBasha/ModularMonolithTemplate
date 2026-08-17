using App.API.Realtime;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Modules.Commerce.Realtime;

[Authorize]
public sealed class CommerceHub : GroupHub<ICommerceHubClient>
{
}
