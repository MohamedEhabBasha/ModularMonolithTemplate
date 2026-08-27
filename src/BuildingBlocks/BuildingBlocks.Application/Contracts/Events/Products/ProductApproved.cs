namespace BuildingBlocks.Application.Contracts.Events.Products;

public sealed record ProductApproved(int ProductId, string SellerId, DateTime ApprovedAt);

