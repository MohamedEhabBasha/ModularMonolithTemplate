using Commerce.Core.Entities.Products;

namespace Commerce.Application.Contracts.Persistence;

public interface IProductRepository : IGenericRepository<Product>
{
    /// <summary>
    /// Decrements stock only if enough is available, in one SQL UPDATE.
    /// Returns true if stock was taken, false if there wasn't enough.
    /// </summary>
    Task<bool> TryDecrementStockAsync(int productId, int quantity);
}