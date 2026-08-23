namespace Commerce.Application.Specifications.Sellers;

public class SellerProfileBySellerId : BaseSpecification<SellerProfile>
{
    public SellerProfileBySellerId(string sellerId)
        : base(sp => sp.UserId == sellerId)
    {
    }
}
