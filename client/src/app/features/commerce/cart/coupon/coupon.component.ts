import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-coupon',
  imports: [],
  templateUrl: './coupon.component.html',
  styleUrl: './coupon.component.css',
})
export class CouponComponent {
  code = signal('');
  status = signal<'idle' | 'applying' | 'applied' | 'error'>('idle');

  updateCode(value: string) {
    this.code.set(value);
    if (this.status() !== 'idle') this.status.set('idle');
  }

  applyCoupon() {
    const value = this.code().trim();
    if (!value) return;

    this.status.set('applying');
    // TODO: wire up to a real CouponService/endpoint once the API exists
  }
}
