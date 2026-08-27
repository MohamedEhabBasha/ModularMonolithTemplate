using BuildingBlocks.Application.Dtos;
using Commerce.Core.Entities.Products;

namespace Commerce.Application.DTOs;

public record SellerProductDto
(
    int Id, 
    string Name, 
    string Description, 
    decimal Price,
    IReadOnlyList<PhotoDto> Pictures, 
    string Type, 
    string Brand, 
    int AvailableQuantity,
    ProductStatus Status, 
    string? RejectionReason, 
    DateTime? ReviewedAt
);
