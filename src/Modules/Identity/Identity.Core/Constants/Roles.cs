namespace Identity.Core.Constants;

public static class Roles
{
    public const string Buyer = "Buyer";
    public const string Seller = "Seller";
    public const string Admin = "Admin";

    public static readonly IReadOnlyCollection<string> All = [Buyer, Seller, Admin];
}
