using Commerce.Application.Contracts.Persistence;
using Commerce.Application.Contracts.Services.Payment;
using Commerce.Core.Entities;
using Commerce.Core.Entities.Cart;
using Microsoft.AspNetCore.Authorization;

namespace App.API.Modules.Commerce;

public class PaymentsController(
    IPaymentServiceResolver paymentServiceResolver,
    IDeliveryMethodRepository dmRepo) : BaseController
{
    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ShoppingCart>> CreateOrUpdatePayment(PaymentRequest request)
    {
        var paymentService = paymentServiceResolver.Resolve(request.BillingAddress.Country);

        var cart = await paymentService.CreateOrUpdatePayment(request)
            ?? throw new BadRequestException("Problem with your cart");

        return Ok(cart);
    }

    [HttpGet("delivery-methods")]
    public async Task<ActionResult<IReadOnlyList<DeliveryMethod>>> GetDeliveryMethods()
    {
        return Ok(await dmRepo.ListAllAsync());
    }
}
