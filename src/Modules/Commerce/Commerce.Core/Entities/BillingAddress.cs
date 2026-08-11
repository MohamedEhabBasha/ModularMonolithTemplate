namespace Commerce.Core.Entities;

public class BillingAddress
{
    public string FirstName { get; set; } = default!;
    public string LastName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public string Country { get; set; } = default!;
    public string City { get; set; } = default!;
    public string Street { get; set; } = default!;
    public string Building { get; set; } = "NA";
    public string Floor { get; set; } = "NA";
    public string Apartment { get; set; } = "NA";
    public string State { get; set; } = "NA";
}
