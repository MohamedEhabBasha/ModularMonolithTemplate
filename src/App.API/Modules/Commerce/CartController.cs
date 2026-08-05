using Commerce.Core.Entities.Cart;
using Commerce.Infrastructure.Services;

namespace App.API.Modules.Commerce;

public class CartController(ShoppingCartCacheService cartService) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<ShoppingCart>> GetCartById(string id)
    {
        var cart = await cartService.GetCartAsync(id);
        return Ok(cart ?? new ShoppingCart { Id = id });
    }

    [HttpPost]
    public async Task<ActionResult<ShoppingCart>> UpdateCart(ShoppingCart cart)
    {
        var updatedCart = await cartService.SetCartAsync(cart)
            ?? throw new BadRequestException("Problem with cart");

        return updatedCart;
    }

    [HttpDelete]
    public async Task<ActionResult> DeleteCart(string id)
    {
        var result = await cartService.DeleteCartAsync(id);
        if (!result) throw new BadRequestException("Problem deleting cart");
        return Ok();
    }
}
