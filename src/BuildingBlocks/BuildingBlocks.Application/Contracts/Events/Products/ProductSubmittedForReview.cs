namespace BuildingBlocks.Application.Contracts.Events.Products;

public sealed record ProductSubmittedForReview(int ProductId, string SellerId, DateTime SubmittedAt);
