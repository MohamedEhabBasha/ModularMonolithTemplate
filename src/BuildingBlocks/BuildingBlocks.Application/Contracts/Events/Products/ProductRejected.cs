namespace BuildingBlocks.Application.Contracts.Events.Products;

public sealed record ProductRejected(int ProductId, string SellerId, string Reason, DateTime RejectedAt);
