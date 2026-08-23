namespace Commerce.Application.DTOs;

public record ProductDto
(
    int Id,
    string Name,
    string Description,
    decimal Price,
    IReadOnlyList<string> PictureUrls,
    string Type,
    string Brand,
    int AvailableQuantity,
    string SellerId,
    string SellerBrandName,
    string? SellerPictureUrl
);
