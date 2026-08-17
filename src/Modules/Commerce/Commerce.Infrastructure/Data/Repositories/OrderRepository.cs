namespace Commerce.Infrastructure.Data.Repositories;

public class OrderRepository(StoreContext context) 
    : GenericRepository<Order>(context), IOrderRepository;
