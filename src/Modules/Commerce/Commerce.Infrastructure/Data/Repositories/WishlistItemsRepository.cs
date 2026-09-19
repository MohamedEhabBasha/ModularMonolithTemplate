namespace Commerce.Infrastructure.Data.Repositories;

public class WishlistItemsRepository(StoreContext context) : GenericRepository<WishlistItem>(context), IWishlistItemsRepository
{
}
