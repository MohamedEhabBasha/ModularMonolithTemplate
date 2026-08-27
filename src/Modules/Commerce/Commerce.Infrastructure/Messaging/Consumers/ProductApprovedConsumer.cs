using BuildingBlocks.Application.Contracts.Events.Products;
using Commerce.Application.Contracts.Notifications;
using Commerce.Application.Contracts.Notifications.Products;
using Commerce.Core.Entities.Products;
using MassTransit;

namespace Commerce.Infrastructure.Messaging.Consumers;

public class ProductApprovedConsumer(ICommerceNotifier notifier) : IConsumer<ProductApproved>
{
    public Task Consume(ConsumeContext<ProductApproved> context) =>
        notifier.ProductReviewedAsync(context.Message.SellerId,
            new ProductReviewedUpdate(context.Message.ProductId, ProductStatus.Approved, null, context.Message.ApprovedAt));
}
