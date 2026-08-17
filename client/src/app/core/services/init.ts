import { inject, Injectable } from '@angular/core';
import { CartService } from './commerce/cart';
import { from, Observable, of, switchMap } from 'rxjs';
import { Cart } from '../../shared/models/commerce/cart';
import { AccountService } from './identity/account';
import { PaymentHubService } from './commerce/payment-hub';

@Injectable({
  providedIn: 'root',
})
export class InitService {
  private readonly cartService = inject(CartService);
  private readonly accountService = inject(AccountService);
  protected paymentHub = inject(PaymentHubService);

  init(): Observable<Cart | null> {
    return from(this.accountService.bootstrap()).pipe(
      switchMap(() => {
        const cartId = localStorage.getItem('cart_id');

        if (cartId) this.paymentHub.connect(cartId);

        return cartId ? this.cartService.getCart(cartId) : of(null);
      }),
    );
  }
}
