using BuildingBlocks.Application.Contracts.Events.Products;
using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Application.Dtos;
using BuildingBlocks.Core.Entities;
using BuildingBlocks.Infrastructure.Services.CloudinaryPhotos;
using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.DTOs.Requests;
using Commerce.Application.Extensions;
using Commerce.Application.Specifications.Products;
using Commerce.Core.Entities.Products;
using Commerce.Infrastructure.Services.SellerProfiles;
using Identity.Core.Constants;
using Identity.Core.Entities;
using MassTransit;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;

namespace App.API.Modules.Commerce;

public class ProductsController
    (
        IStoreUnitOfWork storeUnit,
        IPhotoService photoService,
        IPublishEndpoint bus,
        SellerDisplayResolver sellerDisplayResolver, 
        UserManager<AppUser> userManager
    ) : BaseController
{

    [HttpGet]
    public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts([FromQuery] ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);

        var paged = await Pagination.CreatePagedResult(storeUnit.Products, spec, specParams.PageIndex, specParams.PageSize);

        var sellerDisplays = await sellerDisplayResolver.GetManyAsync(paged.Items.Select(p => p.SellerId));

        var dtos = paged.Items.Select(p => p.ToDto(sellerDisplays)).ToList();

        return Ok(new PagedResult<ProductDto>(dtos, paged.TotalCount, paged.PageIndex, paged.PageSize));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetProduct(int id)
    {
        var spec = new ProductSpecification(id);

        var product = await storeUnit.Products.GetEntityWithSpec(spec)
            ?? throw new NotFoundException("Product Can Not Be Found");

        var sellerDisplays = await sellerDisplayResolver.GetManyAsync([product.SellerId]);

        return Ok(product.ToDto(sellerDisplays));
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> CreateProduct([FromForm] CreateProductRequest request)
    {
        var sellerId = userManager.GetUserId(User)!; // [Authorize] guarantees a claim exists


        var product = new Product
        {
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            Type = request.Type,
            Brand = request.Brand,
            AvailableQuantity = request.AvailableQuantity,
            SellerId = sellerId
        };

        foreach (var file in request.Photos)
        {
            var uploadResult = await photoService.AddPhotoAsync(file);
            if (uploadResult.Error is not null)
                throw new BadRequestException(uploadResult.Error.Message);

            product.AddPhoto(new(uploadResult.SecureUrl.AbsoluteUri, uploadResult.PublicId));
        }

        storeUnit.Products.Add(product);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem creating product.");

        await bus.Publish(new ProductSubmittedForReview(product.Id, product.SellerId, DateTime.UtcNow));

        var sellerDisplays = await sellerDisplayResolver.GetManyAsync([sellerId]);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product.ToDto(sellerDisplays));
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, UpdateProductRequest request)
    {
        var product = await storeUnit.Products.GetByIdAsync(id)
            ?? throw new NotFoundException("Product not found.");

        if (product.SellerId != userManager.GetUserId(User))
            return Forbid();

        product.Update(request.Name, request.Description, request.Price, request.Type, request.Brand, request.AvailableQuantity);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem updating product.");

        await bus.Publish(new ProductSubmittedForReview(product.Id, product.SellerId, DateTime.UtcNow));

        return NoContent();
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpPost("{id:int}/photos")]
    public async Task<ActionResult<PhotoDto>> AddProductPhoto(int id, IFormFile file) // Edit Photo
    {
        if (file.Length == 0) throw new BadRequestException("File is required.");

        var product = await storeUnit.Products.GetByIdAsync(id) ?? throw new NotFoundException("Product not found.");
        if (product.SellerId != userManager.GetUserId(User)) return Forbid();

        var uploadResult = await photoService.AddPhotoAsync(file);
        if (uploadResult.Error is not null) throw new BadRequestException(uploadResult.Error.Message);

        var photo = new Photo(uploadResult.SecureUrl.AbsoluteUri, uploadResult.PublicId);
        product.AddPhoto(photo);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem adding photo.");

        return Ok(new PhotoDto(photo.Url, photo.PublicId));
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpDelete("{id:int}/photos")]
    public async Task<ActionResult> RemoveProductPhoto(int id, [FromQuery] string publicId) // Edit Photo
    {
        var product = await storeUnit.Products.GetByIdAsync(id) ?? throw new NotFoundException("Product not found.");
        if (product.SellerId != userManager.GetUserId(User)) return Forbid();

        if (product.Photos.Count <= 1)
            throw new BadRequestException("A product must have at least one photo.");

        await photoService.DeletePhotoAsync(publicId);
        product.RemovePhoto(publicId);

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem removing photo.");

        return NoContent();
    }

    [Authorize(Roles = Roles.Seller)]
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await storeUnit.Products.GetByIdAsync(id)
            ?? throw new NotFoundException("Product not found.");

        if (product.SellerId != userManager.GetUserId(User))
            return Forbid();

        product.Delete();

        if (!await storeUnit.CommitAsync())
            throw new BadRequestException("Problem deleting product.");

        return NoContent();
    }
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();

        return Ok(await storeUnit.Products.ListAsync(spec));
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();

        return Ok(await storeUnit.Products.ListAsync(spec));
    }
    //private bool ProductExists(int id)
    //{
    //    return storeUnit.Products.Exists(id);
    //}
}
