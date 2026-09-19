namespace Commerce.Application.Specifications.Wishlist;

public class WishlistItemsByUserSpecification : BaseSpecification<WishlistItem>
{
    public WishlistItemsByUserSpecification(string userId) : base(w => w.UserId == userId)
    {
        AddInclude(w => w.Product);
        AddOrderByDescending(w => w.AddedAt);
    }
}
