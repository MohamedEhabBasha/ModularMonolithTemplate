using Microsoft.AspNetCore.SignalR;

namespace App.API.Realtime;

public abstract class GroupHub<TClient> : Hub<TClient>
    where TClient : class
{
    public Task JoinGroup(string groupName) =>
        Groups.AddToGroupAsync(Context.ConnectionId, groupName);

    public Task LeaveGroup(string groupName) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
}
