using BuildingBlocks.Application.Contracts.Persistence;
using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Application.Contracts.Persistence;

public interface IOrderRepository : IGenericRepository<Order>;
