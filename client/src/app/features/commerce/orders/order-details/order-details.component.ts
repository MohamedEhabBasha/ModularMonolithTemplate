import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../../../core/services/commerce/order';
import { Order } from '../../../../shared/models/commerce/order';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";

@Component({
  selector: 'app-order-details',
  imports: [CurrencyPipe, DatePipe, MatProgressSpinner, EmptyStateComponent],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css',
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);

  order = input<Order>(); // provided directly when embedded; fetched by route id otherwise

  private fetchedOrder = signal<Order | null>(null);
  protected loading = signal(false);
  protected displayOrder = computed(() => this.order() ?? this.fetchedOrder());

  ngOnInit() {
    if (this.order()) return; // embedded usage already has the data — no fetch needed

    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) return;

    this.loading.set(true);
    this.orderService
      .getOrderDetailed(id)
      .then((order) => this.fetchedOrder.set(order))
      .finally(() => this.loading.set(false));
  }
}
