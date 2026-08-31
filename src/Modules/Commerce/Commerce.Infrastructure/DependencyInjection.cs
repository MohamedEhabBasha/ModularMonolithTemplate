using BuildingBlocks.Application.Contracts.Services;
using BuildingBlocks.Application.Contracts.Services.Users;
using Commerce.Application.Contracts.Services.Coupons;
using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Contracts.Services.Payment;
using Commerce.Infrastructure.Data;
using Commerce.Infrastructure.Data.Repositories;
using Commerce.Infrastructure.Services;
using Commerce.Infrastructure.Services.Coupons;
using Commerce.Infrastructure.Services.Payment;
using Commerce.Infrastructure.Services.Payment.Paymob;
using Commerce.Infrastructure.Services.SellerProfiles;
using Microsoft.Extensions.Configuration;

namespace Commerce.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddCommerceInfrastructure
        (this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("CommerceDb");

        services.AddDbContext<StoreContext>(opt =>
        {
            opt.UseSqlServer(connectionString);
        });

        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISellerProfileRepository, SellerProfileRepository>();
        services.AddScoped<IDeliveryMethodRepository, DeliveryMethodRepository>();
        services.AddScoped<ICouponRepository, CouponRepository>();
        services.AddScoped<ICouponRedemptionRepository, CouponRedemptionRepository>();

        services.AddScoped<IStoreUnitOfWork, StoreUnitOfWork>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<ICouponService, CouponService>();
        services.AddScoped<IUserProfileProvider, BuyerProfileProvider>();
        services.AddScoped<IUserProfileProvider, SellerProfileProvider>();
        services.AddScoped<ISellerProfileUpdater, SellerProfileUpdater>();
        services.AddScoped<SellerBrandNameCacheService>();
        services.AddScoped<SellerDisplayResolver>();
        services.AddScoped<CouponCacheService>();
        services.AddSingleton<ShoppingCartCacheService>();

        // PAYMENT
        services.AddScoped<IPaymentServiceResolver, PaymentServiceResolver>();
        services.AddKeyedScoped<IPaymentService, StripePaymentService>("Stripe");
        services.AddKeyedScoped<IPaymentService, PaymobPaymentService>("Paymob");

        return services;
    }
}
