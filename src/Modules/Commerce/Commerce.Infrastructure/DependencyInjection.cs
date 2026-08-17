using Commerce.Application.Contracts.Services.Orders;
using Commerce.Application.Contracts.Services.Payment;
using Commerce.Infrastructure.Data;
using Commerce.Infrastructure.Data.Repositories;
using Commerce.Infrastructure.Services;
using Commerce.Infrastructure.Services.Payment;
using Commerce.Infrastructure.Services.Payment.Paymob;
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

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IDeliveryMethodRepository, DeliveryMethodRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IStoreUnitOfWork, StoreUnitOfWork>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddSingleton<ShoppingCartCacheService>();

        // PAYMENT
        services.AddScoped<IPaymentServiceResolver, PaymentServiceResolver>();
        services.AddKeyedScoped<IPaymentService, StripePaymentService>("Stripe");
        services.AddKeyedScoped<IPaymentService, PaymobPaymentService>("Paymob");

        return services;
    }
}
