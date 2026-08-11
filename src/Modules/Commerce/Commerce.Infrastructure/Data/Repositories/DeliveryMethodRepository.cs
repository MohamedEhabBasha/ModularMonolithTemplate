using BuildingBlocks.Infrastructure.Persistence;

namespace Commerce.Infrastructure.Data.Repositories;

public class DeliveryMethodRepository(StoreContext context) : GenericRepository<DeliveryMethod>(context), IDeliveryMethodRepository
{
}
