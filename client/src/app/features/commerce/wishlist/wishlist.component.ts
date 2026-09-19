import { Component, inject, signal } from '@angular/core';
import { WishlistService } from '../../../core/services/commerce/wishlist';
import { Product } from '../../../shared/models/commerce/products/product';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-wishlist',
  imports: [MatProgressSpinner, EmptyStateComponent, RouterLink, MatIcon, CurrencyPipe],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css',
})
export class WishlistComponent {
  private wishlistService = inject(WishlistService);

  products = signal<Product[]>([]);
  loading = signal(true);
  error = signal(false);

  async ngOnInit() {
    try {
      this.products.set(await this.wishlistService.getWishlist());
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }

  async remove(productId: number) {
    await this.wishlistService.remove(productId);
    this.products.update((list) => list.filter((p) => p.id !== productId));
  }
}
