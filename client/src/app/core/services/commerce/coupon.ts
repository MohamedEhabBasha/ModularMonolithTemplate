import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Cart } from '../../../shared/models/commerce/cart';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  applyCoupon(cartId: string, code: string): Promise<Cart> {
    return firstValueFrom(
      this.http.post<Cart>(`${this.baseUrl}cart/coupon`, { code }, { params: { cartId } }),
    );
  }

  removeCoupon(cartId: string): Promise<Cart> {
    return firstValueFrom(
      this.http.delete<Cart>(`${this.baseUrl}cart/coupon`, { params: { cartId } }),
    );
  }
}
