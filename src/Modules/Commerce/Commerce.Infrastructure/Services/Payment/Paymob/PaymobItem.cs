namespace Commerce.Infrastructure.Services.Payment.Paymob;

public class PaymobItem
{
    public string Name { get; set; } = default!;
    public long Amount { get; set; }
    public int Quantity { get; set; } = 1;
}
