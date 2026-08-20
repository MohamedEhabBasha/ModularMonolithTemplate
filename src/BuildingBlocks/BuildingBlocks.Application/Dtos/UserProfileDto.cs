namespace BuildingBlocks.Application.Dtos;

public class UserProfileDto
{
    public required string Id { get; init; }
    public required string Email { get; init; }
    public required string FirstName { get; init; }
    public required string LastName { get; init; }
    public string? PictureUrl { get; init; }
    public required IList<string> Roles { get; init; }
}
