namespace Commerce.Application.Contracts.Notifications;

public interface ICommerceNotifier
{
    Task PaymentStatusChangedAsync(string cartId, PaymentStatusUpdate update);
}
