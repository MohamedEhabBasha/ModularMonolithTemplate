using Commerce.Application.Contracts.Services.Payment;
using Commerce.Core.Entities.Cart;

namespace Commerce.Infrastructure.Services.Payment;

public class StripePaymentService : IPaymentService
{
    public Task<ShoppingCart?> CreateOrUpdatePayment(PaymentRequest request)
    {
        throw new NotImplementedException();
    }
}
