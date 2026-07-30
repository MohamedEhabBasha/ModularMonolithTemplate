using Commerce.Application.Contracts.Persistence;
using Commerce.Application.DTOs;
using Commerce.Application.Specifications.Products;
using Commerce.Core.Entities;

namespace App.API.Modules.Commerce;

public class ProductsController(IProductRepository repo) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<Product>>> GetProducts
        ([FromQuery] ProductSpecParams specParams)
    {
        var spec = new ProductSpecification(specParams);

        return Ok(await Pagination.CreatePagedResult(repo, spec, specParams.PageIndex, specParams.PageSize));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Product Can Not Be Found");

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        repo.Add(product);

        if(await repo.SaveAllAsync())
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

        repo.Update(product);

        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }

        throw new BadRequestException("Problem Updating Product");
    }
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await repo.GetByIdAsync(id)
            ?? throw new NotFoundException("Product Can Not Be Found");

        repo.Remove(product);

        if (await repo.SaveAllAsync())
        {
            return NoContent();
        }

        throw new BadRequestException("Problem Deleting Product");
    }
    [HttpGet("brands")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetBrands()
    {
        var spec = new BrandListSpecification();

        return Ok(await repo.ListAsync(spec));
    }

    [HttpGet("types")]
    public async Task<ActionResult<IReadOnlyList<string>>> GetTypes()
    {
        var spec = new TypeListSpecification();

        return Ok(await repo.ListAsync(spec));
    }
    private bool ProductExists(int id)
    {
        return repo.Exists(id);
    }
}
