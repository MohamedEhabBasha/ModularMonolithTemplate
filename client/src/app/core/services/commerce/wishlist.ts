import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { Product } from '../../../shared/models/commerce/products/product';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  productIds = signal<Set<number>>(new Set());
  count = computed(() => this.productIds().size);

  async load(): Promise<void> {
    const ids = await firstValueFrom(
      this.http.get<number[]>(`${this.baseUrl}wishlist/product-ids`),
    );
    this.productIds.set(new Set(ids));
  }

  getWishlist(): Promise<Product[]> {
    return firstValueFrom(this.http.get<Product[]>(`${this.baseUrl}wishlist`));
  }

  isSaved(productId: number): boolean {
    return this.productIds().has(productId);
  }

  async add(productId: number): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${this.baseUrl}wishlist/${productId}`, {}));
    this.productIds.update((ids) => new Set(ids).add(productId));
  }

  async remove(productId: number): Promise<void> {
    await firstValueFrom(this.http.delete<void>(`${this.baseUrl}wishlist/${productId}`));
    this.productIds.update((ids) => {
      const next = new Set(ids);
      next.delete(productId);
      return next;
    });
  }

  clear(): void {
    this.productIds.set(new Set());
  }
}
