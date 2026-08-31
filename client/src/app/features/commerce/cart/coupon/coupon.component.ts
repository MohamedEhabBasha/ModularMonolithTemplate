import { Component, inject, signal } from '@angular/core';
import { CartService } from '../../../../core/services/commerce/cart';
import { CouponService } from '../../../../core/services/commerce/coupon';

@Component({
  selector: 'app-coupon',
  imports: [],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css',
})
export class CouponComponent {
  private couponService = inject(CouponService);
  private cartService = inject(CartService);

  code = signal('');
  status = signal<'idle' | 'applying' | 'applied' | 'error'>('idle');
  errorMessage = signal('');

  updateCode(value: string) {
    this.code.set(value);
    if (this.status() !== 'idle') this.status.set('idle');
  }

  async applyCoupon() {
    const value = this.code().trim();
    console.log(value);
    const cartId = this.cartService.cart()?.id;
    if (!value || !cartId) return;

    this.status.set('applying');
    try {
      const cart = await this.couponService.applyCoupon(cartId, value);
      this.cartService.cart.set(cart);
      this.status.set('applied');
    } catch (err: any) {
      this.errorMessage.set(err?.error?.detail ?? 'Invalid coupon code.');
      this.status.set('error');
    }
  }

  async removeCoupon() {
    const cartId = this.cartService.cart()?.id;
    if (!cartId) return;
    this.cartService.cart.set(await this.couponService.removeCoupon(cartId));
    this.code.set('');
    this.status.set('idle');
  }
}
