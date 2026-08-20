namespace Commerce.Application.Specifications.Sellers;

public class SellerProfileWithBrandProjectionById : BaseSpecification<SellerProfile, string>
{
    public SellerProfileWithBrandProjectionById(string id) : base(s => s.UserId == id) 
        => AddSelect(s => s.BrandName);
}
