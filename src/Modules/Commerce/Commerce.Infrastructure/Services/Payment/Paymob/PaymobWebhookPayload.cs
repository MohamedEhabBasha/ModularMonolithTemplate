using System.Text.Json.Serialization;

namespace Commerce.Infrastructure.Services.Payment.Paymob;

public class PaymobWebhookPayload
{
    [JsonPropertyName("type")] 
    public string Type { get; set; } = string.Empty;

    [JsonPropertyName("obj")] 
    public PaymobTransactionObj Obj { get; set; } = default!;

}

public class PaymobTransactionObj
{
    [JsonPropertyName("id")] public long Id { get; set; }
    [JsonPropertyName("pending")] public bool Pending { get; set; }
    [JsonPropertyName("amount_cents")] public long AmountCents { get; set; }
    [JsonPropertyName("success")] public bool Success { get; set; }
    [JsonPropertyName("is_auth")] public bool IsAuth { get; set; }
    [JsonPropertyName("is_capture")] public bool IsCapture { get; set; }
    [JsonPropertyName("is_standalone_payment")] public bool IsStandalonePayment { get; set; }
    [JsonPropertyName("is_voided")] public bool IsVoided { get; set; }
    [JsonPropertyName("is_refunded")] public bool IsRefunded { get; set; }
    [JsonPropertyName("is_3d_secure")] public bool Is3dSecure { get; set; }
    [JsonPropertyName("integration_id")] public long IntegrationId { get; set; }
    [JsonPropertyName("has_parent_transaction")] public bool HasParentTransaction { get; set; }
    [JsonPropertyName("order")] public PaymobOrderRef Order { get; set; } = default!;
    [JsonPropertyName("created_at")] public string CreatedAt { get; set; } = string.Empty;
    [JsonPropertyName("currency")] public string Currency { get; set; } = string.Empty;
    [JsonPropertyName("error_occured")] public bool ErrorOccured { get; set; }
    [JsonPropertyName("owner")] public long Owner { get; set; }
    [JsonPropertyName("source_data")] public PaymobSourceData SourceData { get; set; } = default!;
}

public class PaymobOrderRef 
{
    [JsonPropertyName("id")]
    public long Id { get; set; }

    [JsonPropertyName("merchant_order_id")]
    public string? MerchantOrderId { get; set; }
}

public class PaymobSourceData
{
    [JsonPropertyName("pan")] public string Pan { get; set; } = string.Empty;
    [JsonPropertyName("type")] public string Type { get; set; } = string.Empty;
    [JsonPropertyName("sub_type")] public string SubType { get; set; } = string.Empty;
}
