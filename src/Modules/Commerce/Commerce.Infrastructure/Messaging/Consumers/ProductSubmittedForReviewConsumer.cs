using BuildingBlocks.Application.Contracts.Events.Products;
using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Notifications.Products;
using MassTransit;

namespace Commerce.Infrastructure.Messaging.Consumers;

public class ProductSubmittedForReviewConsumer(ICommerceNotifier notifier) : IConsumer<ProductSubmittedForReview>
{
    public Task Consume(ConsumeContext<ProductSubmittedForReview> context) =>
        notifier.ProductPendingReviewAsync(new ProductPendingReviewUpdate(
            context.Message.ProductId, context.Message.SellerId, context.Message.SubmittedAt));
}
