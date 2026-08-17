namespace App.API.Modules.Commerce.Realtime;

public static class CommerceGroups
{
    public static string PaymentForUser(string cartId) => $"payments:cart:{cartId}";
}
