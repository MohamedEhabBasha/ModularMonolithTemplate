using Commerce.Core.Entities.Products;

namespace Commerce.Infrastructure.Data.Repositories;

public class ProductRepository(StoreContext context) : GenericRepository<Product>(context) , IProductRepository
{
    public async Task<bool> TryDecrementStockAsync(int productId, int quantity)
    {
        var rowsAffected = await context.Products
            .Where(p => p.Id == productId && p.AvailableQuantity >= quantity)
            .ExecuteUpdateAsync(s => s.SetProperty(
                p => p.AvailableQuantity,
                p => p.AvailableQuantity - quantity));

        return rowsAffected == 1; // 0 rows = not enough stock
    }
}
