import { Component, inject, OnInit, signal } from '@angular/core';
import { OrderService } from '../../../core/services/commerce/order';
import { Order } from '../../../shared/models/commerce/order';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { EmptyStateComponent } from "../../../shared/components/empty-state/empty-state.component";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { RouterLink } from '@angular/router';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-orders',
  imports: [RouterLink, CurrencyPipe, DatePipe, EmptyStateComponent, MatProgressSpinner, MatButton],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  private orderService = inject(OrderService);

  protected orders = signal<Order[]>([]);
  protected loading = signal(true);

  ngOnInit() {
    this.orderService
      .getOrdersForUser()
      .then((orders) => this.orders.set(orders))
      .finally(() => this.loading.set(false));
  }
}
