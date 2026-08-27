import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { SellerProductDto } from '../../../shared/models/commerce/products/seller-product';
import { Product } from '../../../shared/models/commerce/products/product';
import { UpdateProductRequest } from '../../../shared/models/commerce/products/update-product';
import { PhotoDto } from '../../../shared/models/photo-dto';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getMyProducts(): Promise<SellerProductDto[]> {
    return firstValueFrom(this.http.get<SellerProductDto[]>(`${this.baseUrl}seller/products`));
  }

  createProduct(formData: FormData): Promise<Product> {
    return firstValueFrom(this.http.post<Product>(`${this.baseUrl}products`, formData));
  }

  updateProduct(id: number, request: UpdateProductRequest): Promise<void> {
    return firstValueFrom(this.http.put<void>(`${this.baseUrl}products/${id}`, request));
  }

  addProductPhoto(productId: number, file: File): Promise<PhotoDto> {
    const formData = new FormData();
    formData.append('file', file);
    return firstValueFrom(
      this.http.post<PhotoDto>(`${this.baseUrl}products/${productId}/photos`, formData),
    );
  }

  removeProductPhoto(productId: number, publicId: string): Promise<void> {
    const params = new HttpParams().set('publicId', publicId);
    return firstValueFrom(
      this.http.delete<void>(`${this.baseUrl}products/${productId}/photos`, { params }),
    );
  }

  deleteProduct(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.baseUrl}products/${id}`));
  }
}
