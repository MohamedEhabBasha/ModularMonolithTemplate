using Commerce.Core.Entities.Products;

namespace Commerce.Core.Entities;

public class WishlistItem : BaseEntity
{
    public string UserId { get; private set; } = default!; // soft reference — same pattern as Product.SellerId
    public int ProductId { get; private set; }
    public Product Product { get; private set; } = default!; // real FK — Product lives in this same context
    public DateTime AddedAt { get; private set; }

    private WishlistItem() { }

    public static WishlistItem Create(string userId, int productId) =>
        new() { UserId = userId, ProductId = productId, AddedAt = DateTime.UtcNow };
}
