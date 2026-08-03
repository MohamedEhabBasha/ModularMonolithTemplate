using BuildingBlocks.Application.Contracts.Services;
using Commerce.Core.Entities.Cart;

namespace Commerce.Infrastructure.Services;

public class ShoppingCartCacheService(ICacheService<ShoppingCart> cache)
{
    private static readonly TimeSpan CartTtl = TimeSpan.FromDays(30);
    private static string Key(string cartId) => $"cart:{cartId}";

    public Task<ShoppingCart?> GetCartAsync(string cartId) =>
        cache.GetAsync(Key(cartId));

    public Task<ShoppingCart?> SetCartAsync(ShoppingCart cart) =>
        cache.SetAsync(Key(cart.Id), cart, CartTtl);

    public Task<bool> DeleteCartAsync(string cartId) =>
        cache.DeleteAsync(Key(cartId));
}
