using BuildingBlocks.Application.Contracts.Events.Products;
using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.DTOs.Requests;
using Commerce.Application.Extensions;
using Commerce.Application.Specifications.Products;
using Commerce.Core.Entities.Products;
using Commerce.Infrastructure.Services.SellerProfiles;
using Identity.Core.Entities;
using MassTransit;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Commerce.Admin;

public class ProductsController
    (
        IStoreUnitOfWork storeUnit,
        SellerDisplayResolver sellerDisplayResolver,
        UserManager<AppUser> userManager,
        IPublishEndpoint bus
    ) : AdminController
{
    [HttpGet("pending")]
    public async Task<ActionResult<IReadOnlyList<ProductDto>>> GetPendingProducts()
    {
        var spec = new ProductSpecification(ProductStatus.Pending);
        var products = await storeUnit.Products.ListAsync(spec);

        var sellerDisplays = await sellerDisplayResolver.GetManyAsync(products.Select(p => p.SellerId).Distinct());

        return Ok(products.Select(p => p.ToDto(sellerDisplays)).ToList());
    }

    [HttpPut("{id:int}/approve")]
    public async Task<ActionResult> ApproveProduct(int id)
    {
        var product = await storeUnit.Products.GetByIdAsync(id)
            ?? throw new NotFoundException("Product not found.");

        if (product.Status != ProductStatus.Pending)
            throw new BadRequestException("Only pending products can be reviewed.");

        product.Approve(userManager.GetUserId(User)!);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem approving product.");

        await bus.Publish(new ProductApproved(product.Id, product.SellerId, DateTime.UtcNow));

        return NoContent();
    }

    [HttpPut("{id:int}/reject")]
    public async Task<ActionResult> RejectProduct(int id, RejectProductRequest request)
    {
        var product = await storeUnit.Products.GetByIdAsync(id)
            ?? throw new NotFoundException("Product not found.");

        if (product.Status != ProductStatus.Pending)
            throw new BadRequestException("Only pending products can be reviewed.");

        product.Reject(userManager.GetUserId(User)!, request.Reason);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem rejecting product.");

        await bus.Publish(new ProductRejected(product.Id, product.SellerId, request.Reason, DateTime.UtcNow));

        return NoContent();
    }
}
