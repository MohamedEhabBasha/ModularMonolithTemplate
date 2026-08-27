using App.API.Realtime;
using Identity.Core.Constants;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace App.API.Modules.Commerce.Realtime;

//Client side call the method's name - strongly typed -
[Authorize]
public sealed class CommerceHub : GroupHub<ICommerceHubClient>
{
    public Task JoinProductAdminGroup()
    {
        if (!Context.User!.IsInRole(Roles.Admin))
            throw new HubException("Not authorized.");

        return Groups.AddToGroupAsync(Context.ConnectionId, CommerceGroups.ProductAdmins);
    }

    // Prevent client from passing another seller id by not accepting any argument   
    public Task JoinMySellerProductGroup()
    {
        var sellerId = Context.UserIdentifier ?? throw new HubException("Not authorized.");
        return Groups.AddToGroupAsync(Context.ConnectionId, CommerceGroups.SellerProductUpdates(sellerId));
    }
    public Task LeaveProductAdminGroup() =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, CommerceGroups.ProductAdmins);

    public Task LeaveMySellerProductGroup()
    {
        var sellerId = Context.UserIdentifier ?? throw new HubException("Not authorized.");
        return Groups.RemoveFromGroupAsync(Context.ConnectionId, CommerceGroups.SellerProductUpdates(sellerId));
    }
}
