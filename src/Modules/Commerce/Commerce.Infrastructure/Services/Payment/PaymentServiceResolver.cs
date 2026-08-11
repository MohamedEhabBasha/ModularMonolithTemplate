using Commerce.Application.Contracts.Services.Payment;

namespace Commerce.Infrastructure.Services.Payment;

public class PaymentServiceResolver(IServiceProvider serviceProvider) : IPaymentServiceResolver
{
    private readonly IServiceProvider _serviceProvider = serviceProvider;

    public IPaymentService Resolve(string countryCode)
    {
        var key = string.Equals(countryCode, "EG", StringComparison.OrdinalIgnoreCase) ? "Paymob" : "Stripe";
        return _serviceProvider.GetRequiredKeyedService<IPaymentService>(key);
    }
}
