namespace Commerce.Infrastructure.Data.Repositories;

public class StoreUnitOfWork
    (
        StoreContext context,
        IProductRepository products,
        IOrderRepository orders,
        IDeliveryMethodRepository deliveryMethods,
        ISellerProfileRepository sellerProfiles,
        ICouponRepository coupons,
        ICouponRedemptionRepository couponRedemptions,
        IWishlistItemsRepository wishlistItems
    )
    : UnitOfWork<StoreContext>(context), IStoreUnitOfWork
{
    public IProductRepository Products => products;
    public IOrderRepository Orders => orders;
    public IDeliveryMethodRepository DeliveryMethods => deliveryMethods;

    public ISellerProfileRepository SellerProfiles => sellerProfiles;

    public ICouponRepository Coupons => coupons;

    public ICouponRedemptionRepository CouponsRedemptions => couponRedemptions;

    public IWishlistItemsRepository WishlistItems => wishlistItems;
}
