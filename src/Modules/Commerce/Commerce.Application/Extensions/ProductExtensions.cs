using Commerce.Application.DTOs;
using Commerce.Core.Entities.Products;

namespace Commerce.Application.Extensions;

public static class ProductExtensions
{
    public static ProductDto ToDto(this Product product, IReadOnlyDictionary<string, SellerDisplayDto> sellerDisplays)
    {
        sellerDisplays.TryGetValue(product.SellerId, out var seller);

        return new ProductDto(
            product.Id, product.Name, product.Description, product.Price,
            [.. product.Photos.Select(p => p.Url)],
            product.Type, product.Brand, product.AvailableQuantity,
            product.SellerId, seller?.BrandName ?? string.Empty, seller?.PictureUrl);
    }
}
