import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Cart } from '../../../shared/models/commerce/cart';

@Injectable({
  providedIn: 'root',
})
export class CheckoutService {
  private http = inject(HttpClient);
  baseUrl = environment.apiUrl;

  createOrUpdatePayment(request: PaymentRequest) {
    return this.http.post<Cart>(`${this.baseUrl}/payments`, request);
  }
}
