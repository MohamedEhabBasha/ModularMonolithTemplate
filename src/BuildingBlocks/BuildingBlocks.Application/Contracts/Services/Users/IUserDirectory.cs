namespace BuildingBlocks.Application.Contracts.Services.Users;

public record UserDisplayInfo(string Id, string FirstName, string LastName, string? PictureUrl);

public interface IUserDirectory
{
    Task<Dictionary<string, UserDisplayInfo>> GetDisplayInfoAsync(IEnumerable<string> userIds);
}
