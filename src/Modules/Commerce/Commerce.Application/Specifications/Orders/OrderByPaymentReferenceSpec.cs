using Commerce.Core.Entities.OrderAggregate;

namespace Commerce.Application.Specifications.Orders;

public class OrderByPaymentReferenceSpec : BaseSpecification<Order>
{
    public OrderByPaymentReferenceSpec(string paymentReference)
    : base(o => o.PaymentTransactionId == paymentReference)
    {
        AddInclude(o => o.OrderItems);
        AddInclude(o => o.DeliveryMethod);
    }
}
