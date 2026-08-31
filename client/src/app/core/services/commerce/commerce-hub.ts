import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import * as signalR from '@microsoft/signalr';
import { Order } from '../../../shared/models/commerce/order';
import { ProductPendingReviewUpdate } from '../../../shared/models/commerce/hubs/productPendingReviewUpdate';
import { ProductReviewedUpdate } from '../../../shared/models/commerce/hubs/productReviewedUpdate';

interface PaymentStatusUpdate {
  status: 'paid' | 'failed';
  order: Order | null;
}

@Injectable({
  providedIn: 'root',
})
export class CommerceHubService {
  private baseUrl = environment.apiUrl;
  private connection?: signalR.HubConnection;
  private connectionPromise?: Promise<void>;

  // --- Payment ---
  status = signal<'pending' | 'paid' | 'failed'>('pending');
  order = signal<Order | null>(null);

  // --- Product moderation ---
  productPendingReview = signal<ProductPendingReviewUpdate | null>(null);
  productReviewed = signal<ProductReviewedUpdate | null>(null);

  private connect(): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}hubs/commerce`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.connection.on('PaymentStatusChanged', (update: PaymentStatusUpdate) => {
      this.status.set(update.status);
      this.order.set(update.order);
    });

    this.connection.on('ProductPendingReview', (update: ProductPendingReviewUpdate) => {
      this.productPendingReview.set(update);
    });

    this.connection.on('ProductReviewed', (update: ProductReviewedUpdate) => {
      this.productReviewed.set(update);
    });

    this.connectionPromise = this.connection.start();
    return this.connectionPromise;
  }

  async joinPaymentGroup(cartId: string) {
    await this.connect();
    await this.connection!.invoke('JoinGroup', `payments:cart:${cartId}`);
  }

  async joinProductAdminGroup() {
    await this.connect();
    await this.connection!.invoke('JoinProductAdminGroup');
  }

  async joinMySellerProductGroup() {
    await this.connect();
    await this.connection!.invoke('JoinMySellerProductGroup');
  }

  async leaveProductAdminGroup() {
    await this.connection?.invoke('LeaveProductAdminGroup');
  }

  async leaveMySellerProductGroup() {
    await this.connection?.invoke('LeaveMySellerProductGroup');
  }

  async disconnect() {
    await this.connection?.stop();
    this.connection = undefined;
    this.connectionPromise = undefined;
  }
}
