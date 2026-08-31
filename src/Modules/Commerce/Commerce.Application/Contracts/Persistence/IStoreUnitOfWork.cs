namespace Commerce.Application.Contracts.Persistence;

public interface IStoreUnitOfWork : IUnitOfWork
{
    IProductRepository Products { get; }
    IOrderRepository Orders { get; }
    IDeliveryMethodRepository DeliveryMethods { get; }
    ISellerProfileRepository SellerProfiles { get; }
    ICouponRepository Coupons { get; }
    ICouponRedemptionRepository CouponsRedemptions { get; }
}
