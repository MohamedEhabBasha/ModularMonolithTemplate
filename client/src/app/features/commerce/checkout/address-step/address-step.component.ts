import { Component, computed, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { BillingAddress } from '../../../../shared/models/commerce/payment/billing-address';
import { TextFieldComponent } from '../../../../shared/components/form-fields/text-field/text-field.component';
import { AccountService } from '../../../../core/services/identity/account';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { Address } from '../../../../shared/models/identity/user';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-address-step',
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatError,
    MatSelect,
    MatOption,
    TextFieldComponent,
    MatCheckbox,
  ],
  templateUrl: './address-step.component.html',
  styleUrl: './address-step.component.css',
})
export class AddressStepComponent {
  private fb = inject(NonNullableFormBuilder);
  private accountService = inject(AccountService);

  readonly addressForm = this.fb.group({
    firstName: [this.accountService.currentUser()?.firstName ?? '', Validators.required],
    lastName: [this.accountService.currentUser()?.lastName ?? '', Validators.required],
    email: [
      this.accountService.currentUser()?.email ?? '',
      [Validators.required, Validators.email],
    ],
    phoneNumber: [this.accountService.currentUser()?.phoneNumber ?? '', Validators.required],
    country: ['', Validators.required],
    city: [this.accountService.currentUser()?.address?.city ?? '', Validators.required],
    street: [this.accountService.currentUser()?.address?.line1 ?? '', Validators.required],
    saveAddress: [false],
  });

  readonly valid = toSignal(
    this.addressForm.statusChanges.pipe(map((status) => status === 'VALID')),
    { initialValue: this.addressForm.valid },
  );

  get value(): BillingAddress {
    const { firstName, lastName, email, phoneNumber, country, city, street } =
      this.addressForm.getRawValue();
    return { firstName, lastName, email, phoneNumber, country, city, street };
  }

  get addressToSave(): Address {
    const { street, city, country } = this.addressForm.getRawValue();
    return { line1: street, city, country };
  }

  get saveAddress(): boolean {
    return this.addressForm.getRawValue().saveAddress;
  }

  get phoneNumber(): string {
    return this.addressForm.getRawValue().phoneNumber;
  }
}
