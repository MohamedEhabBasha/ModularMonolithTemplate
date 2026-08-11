namespace Commerce.Application.Contracts.Services.Payment;

public sealed class PaymentRequest
{
    public required string CartId { get; init; }
    public required BillingAddress BillingAddress { get; init; }
}
