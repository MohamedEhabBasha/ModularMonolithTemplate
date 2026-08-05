import { inject, Injectable } from '@angular/core';
import { CartService } from './commerce/cart';
import { Observable, of } from 'rxjs';
import { Cart } from '../../shared/models/commerce/cart';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private readonly cartService = inject(CartService);

  init(): Observable<Cart | null> {
    const cartId = localStorage.getItem('cart_id');

    return cartId ? this.cartService.getCart(cartId) : of(null);
  }
}
