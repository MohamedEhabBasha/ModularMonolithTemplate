namespace App.API.Modules.Commerce.Realtime;

public static class CommerceGroups
{
    public static string PaymentForUser(string cartId) => $"payments:cart:{cartId}";
    public const string ProductAdmins = "product:admins";
    public static string SellerProductUpdates(string sellerId) => $"seller:products:{sellerId}";
}
