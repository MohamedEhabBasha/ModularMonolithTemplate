using Commerce.Core.Entities.Products;

namespace Commerce.Application.Contracts.Notifications.Products;

public record ProductReviewedUpdate(int ProductId, ProductStatus Status, string? RejectionReason, DateTime ReviewedAt);
