using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Notifications.Products;
using Microsoft.AspNetCore.SignalR;

namespace App.API.Modules.Commerce.Realtime;

public class SignalRCommerceNotifier
    (IHubContext<CommerceHub, ICommerceHubClient> hub) : ICommerceNotifier
{
    public Task PaymentStatusChangedAsync(string cartId, PaymentStatusUpdate update) =>
        hub.Clients
            .Group(CommerceGroups.PaymentForUser(cartId))
            .PaymentStatusChanged(update);
    public Task ProductPendingReviewAsync(ProductPendingReviewUpdate update) =>
        hub.Clients.Group(CommerceGroups.ProductAdmins).ProductPendingReview(update);

    public Task ProductReviewedAsync(string sellerId, ProductReviewedUpdate update) =>
        hub.Clients.Group(CommerceGroups.SellerProductUpdates(sellerId)).ProductReviewed(update);
}
