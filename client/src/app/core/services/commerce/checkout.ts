import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Cart } from '../../../shared/models/commerce/cart';
import { DeliveryMethod } from '../../../shared/models/commerce/payment/delivery-method';
import { tap } from 'rxjs';
import { PaymentRequest } from '../../../shared/models/commerce/payment/payment-request';
import { CartService } from './cart';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  //private cartService = inject(CartService);

  deliveryMethods = signal<DeliveryMethod[]>([]);

  loadDeliveryMethods() {
    return this.http
      .get<DeliveryMethod[]>(`${this.baseUrl}payments/delivery-methods`)
      .pipe(tap((methods) => this.deliveryMethods.set(methods)));
  }

  createOrUpdatePayment(request: PaymentRequest) {
    return this.http
      .post<Cart>(`${this.baseUrl}payments`, request)
      //.pipe(tap((cart) => this.cartService.setCart(cart)));
  }

  // paymob-webhook-result
  getPaymentStatus(merchantOrderId: string) {
    return this.http.get<{ status: 'pending' | 'paid' | 'failed' }>(
      `${this.baseUrl}paymobWebhook/status/${merchantOrderId}`,
    );
  }
}
