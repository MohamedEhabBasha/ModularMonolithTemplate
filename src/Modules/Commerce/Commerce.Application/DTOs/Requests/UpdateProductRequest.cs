namespace Commerce.Application.DTOs.Requests;

public class UpdateProductRequest
{
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public required string Type { get; set; }
    public required string Brand { get; set; }
    public int AvailableQuantity { get; set; }
}
