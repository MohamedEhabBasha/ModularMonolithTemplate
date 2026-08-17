import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';

import { Order } from '../../../shared/models/commerce/order';
import { environment } from '../../../../environments/environment.development';

interface PaymentStatusUpdate {
  status: 'paid' | 'failed';
  order: Order | null;
}

@Injectable({
  providedIn: 'root',
})
export class PaymentHubService {
  private baseUrl = environment.apiUrl;
  private connection?: signalR.HubConnection;
  private connectionPromise?: Promise<void>;
  confirmationCanActivate = signal(false);

  status = signal<'pending' | 'paid' | 'failed'>('pending');
  order = signal<Order | null>(null);

  async connect(cartId: string) {
    if (this.connection) return this.connectionPromise;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}hubs/commerce`, { withCredentials: true })
      .withAutomaticReconnect()
      .build();

    this.connection.on('PaymentStatusChanged', (update: PaymentStatusUpdate) => {
      this.status.set(update.status);
      this.order.set(update.order);
      this.confirmationCanActivate.set(true);
    });

    await this.connection.start();
    await this.connection.invoke('JoinGroup', `payments:cart:${cartId}`);

    return this.connectionPromise;
  }

  async disconnect() {
    await this.connection?.stop();
  }
}
