import { inject, Injectable } from '@angular/core';
import { CartService } from './commerce/cart';
import { from, Observable, of, switchMap } from 'rxjs';
import { Cart } from '../../shared/models/commerce/cart';
import { AccountService } from './identity/account';
import { CommerceHubService } from './commerce/commerce-hub';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private readonly cartService = inject(CartService);
  private readonly accountService = inject(AccountService);
  protected commerceHub = inject(CommerceHubService);

  init(): Observable<Cart | null> {
    return from(this.accountService.bootstrap()).pipe(
      switchMap(() => {
        const cartId = localStorage.getItem('cart_id');

        if (cartId) this.commerceHub.joinPaymentGroup(cartId);

        return cartId ? this.cartService.getCart(cartId) : of(null);
      }),
    );
  }
}
