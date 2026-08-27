using Commerce.Application.Contracts.Notifications.Products;

namespace Commerce.Application.Contracts.Notifications;

public interface ICommerceNotifier
{
    Task PaymentStatusChangedAsync(string cartId, PaymentStatusUpdate update);
    Task ProductPendingReviewAsync(ProductPendingReviewUpdate update);
    Task ProductReviewedAsync(string sellerId, ProductReviewedUpdate update);
}
