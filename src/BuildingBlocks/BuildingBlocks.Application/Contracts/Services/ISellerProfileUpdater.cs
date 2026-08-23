namespace BuildingBlocks.Application.Contracts.Services;

public interface ISellerProfileUpdater
{
    Task UpdateBrandNameAsync(string sellerId, string brandName);
}
