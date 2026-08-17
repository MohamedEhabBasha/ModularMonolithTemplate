using Commerce.Application.Contracts.Persistence;
using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Extensions;
using Commerce.Application.Specifications.Orders;
using Identity.Infrastructure.Extensions;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Modules.Commerce;

[Authorize]
public class OrdersController(IStoreUnitOfWork storeUnit, IOrderService orderService) : BaseController
{
    [HttpPost("{cartId}")]
    public async Task<ActionResult<OrderResponseDto>> CreateOrder(string cartId)
    {
        var order = await orderService.CreateOrderFromCartAsync(cartId);
        return order is null ? 
            throw new BadRequestException("Order not ready yet — payment isn't confirmed.") : Ok(order.ToResponseDto());
    }
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<OrderResponseDto>>> GetOrdersForUser()
    {
        var spec = new OrderSpecification(User.GetEmail());

        var orders = await storeUnit.Orders.ListAsync(spec);

        return Ok(orders.Select(o => o.ToResponseDto()));
    }
    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponseDto>> GetOrderById(int id)
    {
        var spec = new OrderSpecification(User.GetEmail(), id);

        var order = await storeUnit.Orders.GetEntityWithSpec(spec);

        return order is null ? NotFound() : Ok(order.ToResponseDto());
    }
}
