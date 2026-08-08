import { Component, inject } from '@angular/core';
import { CartService } from '../../../core/services/commerce/cart';
import { CartItemComponent } from "./cart-item/cart-item.component";
import { OrderSummaryComponent } from "../../../shared/components/commerce/order-summary/order-summary.component";
import { RouterLink } from '@angular/router';
import { CouponComponent } from "./coupon/coupon.component";
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-cart',
  imports: [RouterLink, CartItemComponent, OrderSummaryComponent, CouponComponent, EmptyStateComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent {
  protected cartService = inject(CartService);
}
