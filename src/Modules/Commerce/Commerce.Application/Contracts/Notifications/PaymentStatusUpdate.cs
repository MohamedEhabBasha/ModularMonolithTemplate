using Commerce.Application.Extensions;

namespace Commerce.Application.Contracts.Notifications;

public sealed record PaymentStatusUpdate(string Status, OrderResponseDto? Order);
