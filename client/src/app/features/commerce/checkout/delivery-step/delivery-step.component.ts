import { Component, inject, OnInit } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatRadioModule } from '@angular/material/radio';
import { CurrencyPipe } from '@angular/common';
import { CheckoutService } from '../../../../core/services/commerce/checkout';
import { CartService } from '../../../../core/services/commerce/cart';

@Component({
  selector: 'app-delivery-step',
  imports: [ReactiveFormsModule, MatRadioModule, CurrencyPipe],
  templateUrl: './delivery-step.component.html',
  styleUrl: './delivery-step.component.css',
})
export class DeliveryStepComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  protected checkoutService = inject(CheckoutService);
  protected cartService = inject(CartService);

  readonly deliveryForm = this.fb.group({
    deliveryMethodId: this.fb.control<number | null>(
      this.cartService.cart()?.deliveryMethodId ?? null,
      Validators.required,
    ),
  });

  ngOnInit() {
    this.checkoutService.loadDeliveryMethods().subscribe();

    this.deliveryForm.controls.deliveryMethodId.valueChanges.subscribe((id) => {
      const cart = this.cartService.cart();

      if (!cart || id == null) return;

      this.cartService.cart.set({
        ...cart,
        deliveryMethodId: id,
      });
    });
  }

  get value(): number {
    return this.deliveryForm.getRawValue().deliveryMethodId!;
  }
}
