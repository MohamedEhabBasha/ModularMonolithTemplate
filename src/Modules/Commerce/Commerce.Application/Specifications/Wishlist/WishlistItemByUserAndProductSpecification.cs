namespace Commerce.Application.Specifications.Wishlist;

public class WishlistItemByUserAndProductSpecification(string userId, int productId) 
    : BaseSpecification<WishlistItem>(w => w.UserId == userId && w.ProductId == productId)
{
}
