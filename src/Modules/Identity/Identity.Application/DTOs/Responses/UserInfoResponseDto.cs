using Identity.Application.DTOs.Requests;

namespace Identity.Application.DTOs.Responses;

public record UserInfoResponseDto(string Id, string Email, string FirstName, string LastName, AddressDto? Address, string? PhoneNumber);
