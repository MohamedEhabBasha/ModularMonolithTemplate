using Commerce.Application.Contracts.Notifications;
using Microsoft.AspNetCore.SignalR;

namespace App.API.Modules.Commerce.Realtime;

public class SignalRCommerceNotifier
    (IHubContext<CommerceHub, ICommerceHubClient> hub) : ICommerceNotifier
{
    public Task PaymentStatusChangedAsync(string cartId, PaymentStatusUpdate update) =>
        hub.Clients
            .Group(CommerceGroups.PaymentForUser(cartId))
            .PaymentStatusChanged(update);
}
