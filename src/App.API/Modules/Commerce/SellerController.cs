using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.Extensions;
using Commerce.Application.Specifications.Products;
using Identity.Core.Constants;
using Identity.Core.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Commerce;

[Authorize(Roles = Roles.Seller)]
public class SellerController(IStoreUnitOfWork storeUnit, UserManager<AppUser> userManager) : BaseController
{
    [HttpGet("products")]
    public async Task<ActionResult<IReadOnlyList<SellerProductDto>>> GetMyProducts()
    {
        var sellerId = userManager.GetUserId(User)!;
        var spec = new ProductSpecification(sellerId);
        var products = await storeUnit.Products.ListAsync(spec);

        return Ok(products.Select(p => p.ToSellerDto()).ToList());
    }
}
