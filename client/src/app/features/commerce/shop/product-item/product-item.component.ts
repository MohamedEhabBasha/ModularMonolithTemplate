import { Component, input } from '@angular/core';
import { Product } from '../../../../shared/models/commerce/products';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-item',
  imports: [CommonModule, CurrencyPipe, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './product-item.component.html',
  styleUrl: './product-item.component.css',
})
export class ProductItemComponent {
  product = input.required<Product>();

  onAddToCart(): void {}
}
