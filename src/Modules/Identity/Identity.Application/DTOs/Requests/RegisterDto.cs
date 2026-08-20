using Identity.Core.Constants;

namespace Identity.Application.DTOs.Requests;

public class RegisterDto
{
    [Required]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    public string LastName { get; set; } = string.Empty;

    [Required]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;

    [Required]
    [EnumDataType(typeof(AccountType))]
    public AccountType? AccountType { get; set; }
}
