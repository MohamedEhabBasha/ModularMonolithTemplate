import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Order } from '../../../shared/models/commerce/order';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);

  createOrder(cartId: string) {
    return this.http.post<Order>(`${this.baseUrl}orders/${cartId}`, {});
  }

  async getOrdersForUser() {
    return await firstValueFrom(this.http.get<Order[]>(this.baseUrl + 'orders'));
  }

  async getOrderDetailed(id: number) {
    return await firstValueFrom(this.http.get<Order>(this.baseUrl + 'orders/' + id));
  }
}
