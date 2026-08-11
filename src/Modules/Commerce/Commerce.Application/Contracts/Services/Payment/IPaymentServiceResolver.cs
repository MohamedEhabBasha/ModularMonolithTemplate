namespace Commerce.Application.Contracts.Services.Payment;

public interface IPaymentServiceResolver
{
    IPaymentService Resolve(string countryCode);
}
