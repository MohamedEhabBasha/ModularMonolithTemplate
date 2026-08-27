using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Notifications.Products;

namespace App.API.Modules.Commerce.Realtime;

public interface ICommerceHubClient
{
    Task PaymentStatusChanged(PaymentStatusUpdate update);
    Task ProductPendingReview(ProductPendingReviewUpdate update);
    Task ProductReviewed(ProductReviewedUpdate update);
}
