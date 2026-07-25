using Commerce.Core.Entities;
using Commerce.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace App.API.Modules.Commerce;

public class ProductsController(StoreContext context) : BaseController
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
    {
        return await context.Products.ToListAsync();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Product>> GetProduct(int id)
    {
        var product = await context.Products.FindAsync(id);

        if (product == null) return NotFound();

        return Ok(product);
    }

    [HttpPost]
    public async Task<ActionResult<Product>> CreateProduct(Product product)
    {
        context.Products.Add(product);

        await context.SaveChangesAsync();

        return product;
    }
    [HttpPut("{id:int}")]
    public async Task<ActionResult> UpdateProduct(int id, Product product)
    {
        if (id != product.Id || !ProductExists(id))
            return BadRequest("The route ID does not match the product ID.");

        context.Entry(product).State = EntityState.Modified;

        await context.SaveChangesAsync();

        return NoContent();
    }
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> DeleteProduct(int id)
    {
        var product = await context.Products.FindAsync(id);

        if (product == null) return NotFound();

        context.Products.Remove(product);

        await context.SaveChangesAsync();

        return NoContent();
    }
    private bool ProductExists(int id)
    {
        return context.Products.Any(p => p.Id == id);
    }
}
