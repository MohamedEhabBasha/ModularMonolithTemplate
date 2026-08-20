using System.Text.Json.Serialization;

namespace Commerce.Core.Entities.Products;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ProductStatus
{
    Pending,
    Approved,
    Rejected
}
