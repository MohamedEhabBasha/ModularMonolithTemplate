using BuildingBlocks.Application.Dtos;
using Commerce.Application.DTOs;
using Commerce.Core.Entities.Products;

namespace Commerce.Application.Extensions;

public static class ProductExtensions
{
    public static ProductDto ToDto(this Product product, IReadOnlyDictionary<string, SellerDisplayDto> sellerDisplays)
    {
        sellerDisplays.TryGetValue(product.SellerId, out var seller);

        return new (
            product.Id, product.Name, product.Description, product.Price,
            [.. product.Photos.Select(p => p.Url)],
            product.Type, product.Brand, product.AvailableQuantity,
            product.SellerId, seller?.BrandName ?? string.Empty, seller?.PictureUrl);
    }
    public static SellerProductDto ToSellerDto(this Product product) =>
        new
        (
            product.Id, 
            product.Name, 
            product.Description, 
            product.Price,
            [.. product.Photos.Select(p => new PhotoDto(p.Url, p.PublicId))], 
            product.Type,
            product.Brand, 
            product.AvailableQuantity,
            product.Status, 
            product.RejectionReason,
            product.ReviewedAt
        );
}
