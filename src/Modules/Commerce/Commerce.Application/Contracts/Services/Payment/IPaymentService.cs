using Commerce.Core.Entities.Cart;

namespace Commerce.Application.Contracts.Services.Payment;

public interface IPaymentService
{
    Task<ShoppingCart?> CreateOrUpdatePayment(PaymentRequest request);
}
