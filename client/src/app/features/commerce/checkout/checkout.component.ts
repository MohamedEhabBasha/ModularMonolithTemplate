import { Component, inject, signal, viewChild } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CartService } from '../../../core/services/commerce/cart';
import { CheckoutService } from '../../../core/services/commerce/checkout';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { MatButton } from '@angular/material/button';
import { AddressStepComponent } from './address-step/address-step.component';
import { pipe, switchMap } from 'rxjs';
import { AccountService } from '../../../core/services/identity/account';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, MatStepper, MatStep, MatButton, AddressStepComponent],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent {
  protected checkoutService = inject(CheckoutService);
  private accountService = inject(AccountService);
  protected cartService = inject(CartService);

  private addressStepComponent = viewChild.required(AddressStepComponent);
  protected saving = signal(false);

  onAddressNext(stepper: MatStepper) {
    const step = this.addressStepComponent();

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
}
