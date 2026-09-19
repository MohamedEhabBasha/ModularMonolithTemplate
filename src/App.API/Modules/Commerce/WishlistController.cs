using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.Extensions;
using Commerce.Application.Specifications.Wishlist;
using Commerce.Core.Entities;
using Commerce.Infrastructure.Services.SellerProfiles;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Commerce;

[Authorize]
public class WishlistController
    (IStoreUnitOfWork storeUnit, SellerDisplayResolver sellerDisplayResolver, UserManager<AppUser> userManager) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetWishlist()
    {
        var userId = userManager.GetUserId(User)!;
        var items = await storeUnit.WishlistItems.ListAsync(new WishlistItemsByUserSpecification(userId));

        var products = items.Select(w => w.Product).ToList();
        var sellerDisplays = await sellerDisplayResolver.GetManyAsync(products.Select(p => p.SellerId).Distinct());

        return Ok(products.Select(p => p.ToDto(sellerDisplays)).ToList());
    }

    [HttpGet("product-ids")]
    public async Task<ActionResult<IReadOnlyList<int>>> GetWishlistProductIds()
    {
        var userId = userManager.GetUserId(User)!;
        var items = await storeUnit.WishlistItems.ListAsync(new WishlistItemsByUserSpecification(userId));
        return Ok(items.Select(w => w.ProductId).ToList());
    }

    [HttpPost("{productId:int}")]
    public async Task<ActionResult> AddToWishlist(int productId)
    {
        var userId = userManager.GetUserId(User)!;
        var spec = new WishlistItemByUserAndProductSpecification(userId, productId);
        if (await storeUnit.WishlistItems.GetEntityWithSpec(spec) is not null) return NoContent();

        var product = await storeUnit.Products.GetByIdAsync(productId) ?? throw new NotFoundException("Product not found.");
        storeUnit.WishlistItems.Add(WishlistItem.Create(userId, product.Id));
        if (!await storeUnit.CommitAsync()) throw new BadRequestException("Problem saving product.");
        return NoContent();
    }

    [HttpDelete("{productId:int}")]
    public async Task<ActionResult> RemoveFromWishlist(int productId)
    {
        var userId = userManager.GetUserId(User)!;
        var spec = new WishlistItemByUserAndProductSpecification(userId, productId);
        var item = await storeUnit.WishlistItems.GetEntityWithSpec(spec);
        if (item is null) return NoContent();

        storeUnit.WishlistItems.Remove(item);
        if (!await storeUnit.CommitAsync()) throw new BadRequestException("Problem removing product.");
        return NoContent();
    }
}
