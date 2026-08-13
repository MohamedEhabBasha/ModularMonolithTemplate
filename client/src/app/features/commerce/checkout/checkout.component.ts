import { Component, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/commerce/cart';
import { CheckoutService } from '../../../core/services/commerce/checkout';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { AddressStepComponent } from './address-step/address-step.component';
import { pipe, switchMap } from 'rxjs';
import { AccountService } from '../../../core/services/identity/account';
import { DeliveryStepComponent } from './delivery-step/delivery-step.component';
import { SnackbarService } from '../../../core/services/snackbar';
import { ReviewStepComponent } from './review-step/review-step.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { OrderSummaryComponent } from '../../../shared/components/commerce/order-summary/order-summary.component';

@Component({
  selector: 'app-checkout',
  imports: [
    ReactiveFormsModule,
    MatProgressSpinner,
    MatStepper,
    MatStep,
    MatButton,
    AddressStepComponent,
    DeliveryStepComponent,
    ReviewStepComponent,
    CurrencyPipe,
    OrderSummaryComponent,
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  private accountService = inject(AccountService);
  private snackbarService = inject(SnackbarService);
  protected checkoutService = inject(CheckoutService);
  protected cartService = inject(CartService);

  protected addressStep = viewChild.required(AddressStepComponent);
  protected deliveryStep = viewChild.required(DeliveryStepComponent);
  protected reviewStep = viewChild.required(ReviewStepComponent);

  protected saving = signal(false);
  protected redirectUrl = signal<string | null>(null);

  onAddressNext(stepper: MatStepper) {
    const step = this.addressStep();

    if (step.addressForm.invalid) {
      step.addressForm.markAllAsTouched();
      return;
    }

    if (!step.saveAddress) {
      stepper.next();
      return;
    }

    this.saving.set(true);

    this.accountService
      .updateAddress(step.addressToSave)
      .pipe(switchMap(() => this.accountService.updatePhoneNumber(step.phoneNumber)))
      .subscribe({
        next: () => {
          this.saving.set(false);
          stepper.next();
        },
        error: () => {
          this.saving.set(false);
        },
      });
  }

  onDeliveryNext(stepper: MatStepper) {
    const step = this.deliveryStep();
    if (step.deliveryForm.invalid) {
      step.deliveryForm.markAllAsTouched();
      return;
    }

    const cart = this.cartService.cart();
    if (!cart) return;

    this.saving.set(true);

    this.cartService
      .setCart({ ...cart, deliveryMethodId: step.value })
      .pipe(
        switchMap((updatedCart) =>
          this.checkoutService.createOrUpdatePayment({
            cartId: updatedCart.id,
            billingAddress: this.addressStep().value,
          }),
        ),
      )
      .subscribe({
        next: (updatedCart) => {
          this.saving.set(false);
          this.redirectUrl.set(updatedCart.redirectUrl ?? null); // adjust to your Cart type's field name
          stepper.next();
        },
        error: (err) => {
          this.saving.set(false);
          this.snackbarService.error(err.message ?? 'Could not proceed to payment');
        },
      });
  }
}
