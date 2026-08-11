namespace Commerce.Infrastructure.Services.Payment.Paymob;

public class PaymobIntentionRequest
{
    public long Amount { get; set; }
    public string Currency { get; set; } = "EGP";
    public List<int> PaymentMethods { get; set; } = [];
    public List<PaymobItem> Items { get; set; } = [];
    public BillingAddress BillingData { get; set; } = new();
}
