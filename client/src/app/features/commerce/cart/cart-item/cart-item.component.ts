import { Component, inject, input } from '@angular/core';
import { CartItem } from '../../../../shared/models/commerce/cart';
import { CartService } from '../../../../core/services/commerce/cart';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-item',
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './cart-item.component.html',
  styleUrl: './cart-item.component.css',
})
export class CartItemComponent {
readonly item = input.required<CartItem>();
  protected cartService = inject(CartService);

  incrementQuantity() {
    this.cartService.addItemToCart(this.item());
  }
  decrementQuantity() {
    this.cartService.removeItemFromCart(this.item().productId);
  }
  removeItemFromCart() {
    this.cartService.removeItemFromCart(this.item().productId, this.item().quantity);
  }
}
