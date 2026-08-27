namespace Commerce.Application.Contracts.Notifications.Products;

public record ProductPendingReviewUpdate(int ProductId, string SellerId, DateTime SubmittedAt);

