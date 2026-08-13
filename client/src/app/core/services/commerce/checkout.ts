import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Cart } from '../../../shared/models/commerce/cart';
import { DeliveryMethod } from '../../../shared/models/commerce/payment/delivery-method';
import { tap } from 'rxjs';
import { PaymentRequest } from '../../../shared/models/commerce/payment/payment-request';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  deliveryMethods = signal<DeliveryMethod[]>([]);

  loadDeliveryMethods() {
    return this.http
      .get<DeliveryMethod[]>(`${this.baseUrl}payments/delivery-methods`)
      .pipe(tap((methods) => this.deliveryMethods.set(methods)));
  }

  createOrUpdatePayment(request: PaymentRequest) {
    return this.http.post<Cart>(`${this.baseUrl}payments`, request);
    //TODO call cart.setCart in case this method changes the cart
  }

  // paymob-webhook-result
  getPaymentStatus(cartId: string) {
    return this.http.get<{ status: 'pending' | 'paid' | 'failed' }>(
      `${this.baseUrl}paymobWebhook/status/${cartId}`,
    );
  }
}
