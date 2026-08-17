using Commerce.Application.Contracts.Notifications;

namespace App.API.Modules.Commerce.Realtime;

public interface ICommerceHubClient
{
    Task PaymentStatusChanged(PaymentStatusUpdate update);
}
