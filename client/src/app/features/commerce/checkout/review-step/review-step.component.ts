import { Component, computed, inject, input, signal } from '@angular/core';
import { CartService } from '../../../../core/services/commerce/cart';
import { CurrencyPipe } from '@angular/common';
import { CheckoutService } from '../../../../core/services/commerce/checkout';
import { BillingAddress } from '../../../../shared/models/commerce/payment/billing-address';

@Component({
  selector: 'app-review-step',
  imports: [CurrencyPipe],
  templateUrl: './review-step.component.html',
  styleUrl: './review-step.component.css',
})
export class ReviewStepComponent {
  protected checkoutService = inject(CheckoutService);
  protected cartService = inject(CartService);

  readonly redirectUrl = input.required<string | null>();
  readonly billingAddress = input.required<BillingAddress>();
  readonly redirecting = signal(false);

  protected selectedDelivery = computed(() => {
    const cart = this.cartService.cart();
    return (
      this.checkoutService.deliveryMethods().find((m) => m.id === cart?.deliveryMethodId) ?? null
    );
  });

  pay() {
    const url = this.redirectUrl();
    if (!url) return;
    this.redirecting.set(true);
    window.location.href = url; // full-page navigation to Paymob's hosted checkout
  }
}
