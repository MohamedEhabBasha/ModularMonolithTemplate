using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.Specifications.Products;
using Commerce.Application.Extensions;
using Commerce.Core.Entities.Products;
using Commerce.Infrastructure.Services.SellerProfiles;

namespace App.API.Modules.Commerce;

public class ProductsController(IStoreUnitOfWork storeUnit, SellerDisplayResolver sellerDisplayResolver) : BaseController
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

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        storeUnit.Products.Add(product);

        if(await storeUnit.CommitAsync())
        {
            return CreatedAtAction("GetProduct", new {id = product.Id}, product);
        }

        throw new BadRequestException("Problem Creating Product");
    }
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id || !ProductExists(id))
            throw new BadRequestException("The route ID does not match the product ID.");

        storeUnit.Products.Update(product);

        if (await storeUnit.CommitAsync())
        {
            return NoContent();
        }

        throw new BadRequestException("Problem Updating Product");
    }
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await storeUnit.Products.GetByIdAsync(id)
            ?? throw new NotFoundException("Product Can Not Be Found");

        storeUnit.Products.Remove(product);

        if (await storeUnit.CommitAsync())
        {
            return NoContent();
        }

        throw new BadRequestException("Problem Deleting Product");
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
    private bool ProductExists(int id)
    {
        return storeUnit.Products.Exists(id);
    }
}
