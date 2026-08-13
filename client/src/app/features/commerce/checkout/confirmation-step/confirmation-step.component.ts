import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../../../../core/services/commerce/checkout';
import { interval, switchMap, takeWhile } from 'rxjs';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CartService } from '../../../../core/services/commerce/cart';
import { SnackbarService } from '../../../../core/services/snackbar';

@Component({
  selector: 'app-confirmation-step',
  imports: [RouterLink, MatProgressSpinner],
  templateUrl: './confirmation-step.component.html',
  styleUrl: './confirmation-step.component.css',
})
export class ConfirmationStepComponent {
  private route = inject(ActivatedRoute);
  private snackbar = inject(SnackbarService);
  private checkoutService = inject(CheckoutService);
  private cartService = inject(CartService);

  protected status = signal<'pending' | 'paid' | 'failed'>('pending');

  constructor() {
    const cartId = this.route.snapshot.queryParamMap.get('merchant_order_id');
    if (!cartId) {
      this.status.set('failed');
      return;
    }

    // Polling - send request every 2s until status is 'paid' or 'failed'
    interval(2000)
      .pipe(
        switchMap(() => this.checkoutService.getPaymentStatus(cartId)),
        takeWhile((res) => res.status === 'pending', true), // emits the final value, then stops
      )
      .subscribe({
        next: (res) => {
          this.status.set(res.status);
          if (res.status === 'paid') {
            this.cartService.deleteCart().subscribe();
          }
        },
        error: () => {
          this.snackbar.error('Payment failed');
        },
      });
  }
}
