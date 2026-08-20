namespace Commerce.Infrastructure.Data.Repositories;

public class SellerProfileRepository(StoreContext context)
    : GenericRepository<SellerProfile>(context), ISellerProfileRepository;

