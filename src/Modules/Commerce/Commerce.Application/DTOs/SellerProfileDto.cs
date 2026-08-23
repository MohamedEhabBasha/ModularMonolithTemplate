using BuildingBlocks.Application.Dtos;

namespace Commerce.Application.DTOs;

public class SellerProfileDto : UserProfileDto
{
    public required string BrandName { get; init; }
    public DateTimeOffset? BrandNameChangedAt { get; init; }
}

