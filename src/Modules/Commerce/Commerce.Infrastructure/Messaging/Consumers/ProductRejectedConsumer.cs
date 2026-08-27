using BuildingBlocks.Application.Contracts.Events.Products;
using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Notifications.Products;
using Commerce.Core.Entities.Products;
using MassTransit;

namespace Commerce.Infrastructure.Messaging.Consumers;

public class ProductRejectedConsumer(ICommerceNotifier notifier) : IConsumer<ProductRejected>
{
    public Task Consume(ConsumeContext<ProductRejected> context) =>
        notifier.ProductReviewedAsync(context.Message.SellerId,
            new ProductReviewedUpdate(context.Message.ProductId, ProductStatus.Rejected, context.Message.Reason, context.Message.RejectedAt));
}
