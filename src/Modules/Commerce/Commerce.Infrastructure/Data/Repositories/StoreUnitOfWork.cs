namespace Commerce.Infrastructure.Data.Repositories;

public class StoreUnitOfWork
    (
        StoreContext context,
        IProductRepository products,
        IOrderRepository orders,
        IDeliveryMethodRepository deliveryMethods,
        ISellerProfileRepository sellerProfiles
    )
    : UnitOfWork<StoreContext>(context), IStoreUnitOfWork
{
    public IProductRepository Products => products;
    public IOrderRepository Orders => orders;
    public IDeliveryMethodRepository DeliveryMethods => deliveryMethods;

    public ISellerProfileRepository SellerProfiles => sellerProfiles;
}
