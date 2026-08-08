import { inject, Injectable } from '@angular/core';
import { CartService } from './commerce/cart';
import { from, Observable, of, switchMap } from 'rxjs';
import { Cart } from '../../shared/models/commerce/cart';
import { AccountService } from './identity/account';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private readonly cartService = inject(CartService);
  private readonly accountService = inject(AccountService);

  init(): Observable<Cart | null> {
    return from(this.accountService.bootstrap()).pipe(
      switchMap(() => {
        const cartId = localStorage.getItem('cart_id');

        return cartId ? this.cartService.getCart(cartId) : of(null);
      }),
    );
  }
}
