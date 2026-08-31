import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../../../shared/models/commerce/cart';
import { map, Observable, of, tap } from 'rxjs';
import { Product } from '../../../shared/models/commerce/products/product';
import { CheckoutService } from './checkout';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  baseUrl = environment.apiUrl;
  private http = inject(HttpClient);
  private checkoutService = inject(CheckoutService);

  cart = signal<Cart | null>(null);

  readonly shippingPrice = computed(() => {
    const deliveryMethods = this.checkoutService.deliveryMethods();

    return (
      deliveryMethods.find((method) => method.id === this.cart()?.deliveryMethodId)?.price ?? 0
    );
  });

  itemCount = computed(() => this.cart()?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0);

  totals = computed(() => {
    const cart = this.cart();
    if (!cart) return null;
    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const shipping = this.shippingPrice();
    const discount = cart.discount ?? 0;
    return {
      subtotal,
      shipping,
      discount,
      total: subtotal + shipping - discount,
    };
  });

  getCart(id: string): Observable<Cart> {
    return this.http
      .get<Cart>(this.baseUrl + 'cart', { params: { id } })
      .pipe(tap((cart) => this.cart.set(cart)));
  }

  setCart(cart: Cart): Observable<Cart> {
    return this.http
      .post<Cart>(this.baseUrl + 'cart', cart)
      .pipe(tap((cart) => this.cart.set(cart)));
  }

  deleteCart(): Observable<void> {
    const id = this.cart()?.id;
    if (!id) return of(void 0);

    return this.http.delete<void>(this.baseUrl + 'cart', { params: { id } }).pipe(
      tap(() => {
        localStorage.removeItem('cart_id');
        this.cart.set(null);
      }),
    );
  }

  addItemToCart(item: CartItem | Product, quantity = 1): void {
    const cart = this.cart() ?? this.createCart();
    const cartItem = this.isProduct(item) ? this.mapProductToCartItem(item) : item;
    const updatedCart: Cart = {
      ...cart,
      items: this.addOrUpdateItem(cart.items, cartItem, quantity),
    };

    this.setCart(updatedCart).subscribe({
      error: (err) => console.error('Failed to add item to cart', err),
    });
  }

  removeItemFromCart(productId: number, quantity = 1): void {
    const cart = this.cart();
    if (!cart) return;

    const index = cart.items.findIndex((x) => x.productId === productId);
    if (index === -1) return;

    const items = [...cart.items];
    if (items[index].quantity > quantity) {
      items[index] = { ...items[index], quantity: items[index].quantity - quantity };
    } else {
      items.splice(index, 1);
    }

    const onError = (err: unknown) => console.error('Failed to update cart', err);

    if (items.length === 0) {
      this.deleteCart().subscribe({ error: onError });
    } else {
      this.setCart({ ...cart, items }).subscribe({ error: onError });
    }
  }

  private addOrUpdateItem(items: CartItem[], item: CartItem, quantity: number): CartItem[] {
    const index = items.findIndex((x) => x.productId === item.productId);
    if (index === -1) {
      return [...items, { ...item, quantity }];
    }
    return items.map((existing, i) =>
      i === index ? { ...existing, quantity: existing.quantity + quantity } : existing,
    );
  }

  private mapProductToCartItem(item: Product): CartItem {
    return {
      productId: item.id,
      productName: item.name,
      price: item.price,
      quantity: 0,
      pictureUrl: item.pictureUrls[0],
      brand: item.brand,
      type: item.type,
    };
  }
  private isProduct(item: CartItem | Product): item is Product {
    return (item as Product).id !== undefined;
  }

  private createCart(): Cart {
    const cart = new Cart();
    localStorage.setItem('cart_id', cart.id);
    return cart;
  }
}
