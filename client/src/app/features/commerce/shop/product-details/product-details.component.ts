import {
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
  input,
  linkedSignal,
  output,
  signal,
} from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { ShopService } from '../../../../core/services/commerce/shop';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Product } from '../../../../shared/models/commerce/products/product';

import type { SwiperContainer } from 'swiper/element';
import { CartService } from '../../../../core/services/commerce/cart';
import { WishlistService } from '../../../../core/services/commerce/wishlist';
import { RouterLink } from '@angular/router';

interface ProductMedia {
  readonly type: 'image' | 'video';
  readonly url: string;
  readonly poster?: string;
}

@Component({
  selector: 'app-product-details',
  imports: [RouterLink, CurrencyPipe, MatButtonModule, MatIconModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent {
  readonly id = input.required<string>();

  private readonly shopService = inject(ShopService);
  private readonly cartService = inject(CartService);
  private readonly wishlistService = inject(WishlistService);

  readonly productResource = rxResource({
    params: () => ({ id: Number(this.id()) }),
    stream: ({ params }) => this.shopService.getProduct(params.id),
  });

  readonly media = computed<ProductMedia[]>(() => {
    const product = this.productResource.value();
    return product ? [{ type: 'image', url: product.pictureUrls[0] }] : [];
  });

  readonly cartQuantity = computed<number>(
    () =>
      this.cartService
        .cart()
        ?.items.find((item) => item.productId === this.productResource.value()?.id)?.quantity ?? 0,
  );

  readonly quantity = linkedSignal({
    source: () => this.productResource.value()?.id,
    computation: () => this.cartQuantity() || 1,
  });

  readonly isSaved = computed<boolean>(() => {
    const product = this.productResource.value();
    return product ? this.wishlistService.isSaved(product.id) : false;
  });

  readonly maxQuantity = computed(() => this.productResource.value()?.availableQuantity ?? 0);
  readonly isOutOfStock = computed(() => this.maxQuantity() <= 0);
  readonly exceedsStock = computed(() => this.quantity() > this.maxQuantity());
  readonly addToCartDisabled = computed(() => this.isOutOfStock() || this.exceedsStock());

  readonly stockStatus = computed(() => {
    const stock = this.maxQuantity();
    if (stock <= 0) {
      return { label: 'Out of stock', isWarning: true };
    }
    if (this.exceedsStock() || stock <= 5) {
      return { label: `Only ${stock} left in stock`, isWarning: true };
    }
    return { label: 'In stock', isWarning: false };
  });

  readonly saveToggled = output<{ product: Product; saved: boolean }>();

  retry(): void {
    this.productResource.reload();
  }

  increment(): void {
    this.quantity.update((quantity) => quantity + 1);
  }

  decrement(): void {
    this.quantity.update((quantity) => Math.max(1, quantity - 1));
  }

  onQuantityInput(rawValue: string): void {
    const parsed = Math.trunc(Number(rawValue));
    this.quantity.set(Number.isFinite(parsed) && parsed > 0 ? parsed : 1);
  }

  addToCart(): void {
    const product = this.productResource.value();
    if (!product || this.addToCartDisabled()) {
      return;
    }

    if (this.quantity() > this.cartQuantity()) {
      this.cartService.addItemToCart(
        this.productResource.value() as Product,
        this.quantity() - this.cartQuantity(),
      );
    } else if (this.quantity() < this.cartQuantity()) {
      this.cartService.removeItemFromCart(
        this.productResource.value()!.id,
        this.cartQuantity() - this.quantity(),
      );
    }
  }

  async toggleSave(): Promise<void> {
    const product = this.productResource.value();
    if (!product) {
      return;
    }

    if (this.wishlistService.isSaved(product.id)) {
      await this.wishlistService.remove(product.id);
    } else {
      await this.wishlistService.add(product.id);
    }

    this.saveToggled.emit({ product, saved: this.wishlistService.isSaved(product.id) });
  }

  /** Pauses any video slide once it's scrolled out of the active position. */
  onSlideChange(event: Event): void {
    const swiperContainer = event.currentTarget as SwiperContainer;
    swiperContainer.querySelectorAll('video').forEach((video) => {
      const slide = video.closest('swiper-slide');
      if (!slide?.classList.contains('swiper-slide-active')) {
        video.pause();
      }
    });
  }
}