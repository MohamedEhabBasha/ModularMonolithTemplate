import { Component, DestroyRef, effect, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CartService } from '../../../../core/services/commerce/cart';
import { MatButton } from '@angular/material/button';
import { OrderDetailsComponent } from '../../orders/order-details/order-details.component';
import { PaymentHubService } from '../../../../core/services/commerce/payment-hub';
import { CheckoutService } from '../../../../core/services/commerce/checkout';
import { OrderService } from '../../../../core/services/commerce/order';
import { SnackbarService } from '../../../../core/services/snackbar';

@Component({
  selector: 'app-confirmation-step',
  imports: [RouterLink, MatProgressSpinner, MatButton, OrderDetailsComponent],
  templateUrl: './confirmation-step.component.html',
  styleUrl: './confirmation-step.component.css',
})
export class ConfirmationStepComponent {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private cartService = inject(CartService);
  private orderService = inject(OrderService);
  private snackbar = inject(SnackbarService);
  private checkoutService = inject(CheckoutService);
  protected paymentHub = inject(PaymentHubService);

  protected status = this.paymentHub.status;
  protected order = this.paymentHub.order;
  private cartDeleted = false;

  constructor() {
    const merchantOrderId = this.route.snapshot.queryParamMap.get('merchant_order_id');
    const cartId =
      merchantOrderId && merchantOrderId.length > 8
        ? merchantOrderId.slice(0, -8)
        : merchantOrderId;

    if (!cartId || !merchantOrderId) {
      this.status.set('failed');
      return;
    }

    this.paymentHub.connect(cartId).then(() => {
      if (this.status() !== 'pending') return; // a push already resolved it — don't overwrite
      this.checkoutService.getPaymentStatus(merchantOrderId).subscribe((res) => {
        this.status.set(res.status);
      });
    });

    effect(() => {
      if (this.status() !== 'paid') return;

      if (this.order()) {
        if (!this.cartDeleted) {
          this.cartDeleted = true;
          this.cartService.deleteCart().subscribe();
        }
        return;
      }

      this.orderService.createOrder(cartId).subscribe({
        next: (order) => {
          this.order.set(order);
          this.paymentHub.confirmationCanActivate.set(true);
        },
        error: () =>
          this.snackbar.error(
            'Payment succeeded, but finalizing your order failed — contact support.',
          ),
      });
    });

    this.destroyRef.onDestroy(() => {
      this.paymentHub.disconnect();
      this.paymentHub.confirmationCanActivate.set(false);
      this.paymentHub.order.set(null);
    });
  }
}
