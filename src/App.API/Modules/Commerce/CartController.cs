using Commerce.Application.Contracts.Services.Coupons;
using Commerce.Application.DTOs.Requests;
using Commerce.Core.Entities.Cart;
using Commerce.Infrastructure.Services;

namespace App.API.Modules.Commerce;

public class CartController(ShoppingCartCacheService cartService, ICouponService couponService) : BaseController
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

    [HttpPost("coupon")]
    public async Task<ActionResult<ShoppingCart>> ApplyCoupon(string cartId, ApplyCouponRequest request)
    {
        var cart = await cartService.GetCartAsync(cartId) ?? throw new NotFoundException("Cart not found.");
        var subtotal = cart.Items.Sum(i => i.Price * i.Quantity);

        var preview = await couponService.PreviewAsync(request.Code, cart.BillingAddress?.Email, subtotal);
        cart.CouponCode = preview.Code;
        cart.Discount = preview.DiscountAmount;

        return Ok(await cartService.SetCartAsync(cart) ?? throw new BadRequestException("Problem with cart"));
    }

    [HttpDelete("coupon")]
    public async Task<ActionResult<ShoppingCart>> RemoveCoupon(string cartId)
    {
        var cart = await cartService.GetCartAsync(cartId) ?? throw new NotFoundException("Cart not found.");
        cart.CouponCode = null;
        cart.Discount = 0;
        return Ok(await cartService.SetCartAsync(cart) ?? throw new BadRequestException("Problem with cart"));
    }
}
