using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Application.Contracts.Services.Orders;

public interface IOrderService
{
    Task<Order?> CreateOrderFromCartAsync(string cartId);
}
