import { Component, inject, input } from '@angular/core';
import { Product } from '../../../../shared/models/commerce/products/product';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../../core/services/commerce/cart';
import { SnackbarService } from '../../../../core/services/snackbar';

@Component({
  selector: 'app-product-item',
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule, RouterLink],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css',
})
export class ProductItemComponent {
  product = input.required<Product>();

  private cartService = inject(CartService);
  private snackbar = inject(SnackbarService);

  onAddToCart(): void {
    this.cartService.addItemToCart(this.product());
    this.snackbar.success('One item added to cart!');
  }
}
