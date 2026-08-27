import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { Product } from '../../../shared/models/commerce/products/product';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPendingProducts(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(`${this.baseUrl}admin/products/pending`));
  }

  approveProduct(id: number): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.baseUrl}admin/products/${id}/approve`, {}));
  }

  rejectProduct(id: number, reason: string): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${this.baseUrl}admin/products/${id}/reject`, { reason }),
    );
  }
}
