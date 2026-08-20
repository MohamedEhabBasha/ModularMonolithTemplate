using Commerce.Core.Entities.Products;

namespace Commerce.Infrastructure.Data.Repositories;

public class ProductRepository(StoreContext context) : GenericRepository<Product>(context) , IProductRepository
{
}
