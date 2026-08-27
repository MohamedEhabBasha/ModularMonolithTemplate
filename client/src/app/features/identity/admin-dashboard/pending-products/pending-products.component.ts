import { Component, DestroyRef, effect, inject, resource, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/identity/admin';
import { CommerceHubService } from '../../../../core/services/commerce/commerce-hub';
import { MatFormField, MatLabel } from "@angular/material/form-field";
import { EmptyStateComponent } from "../../../../shared/components/empty-state/empty-state.component";
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';

@Component({
  selector: 'app-pending-products',
  imports: [MatFormField, MatLabel, EmptyStateComponent, CurrencyPipe, MatButton, MatInput],
  templateUrl: './pending-products.component.html',
  styleUrl: './pending-products.component.css',
})
export class PendingProductsComponent {
  private destroyRef = inject(DestroyRef);
  private adminProductsService = inject(AdminService);
  private commerceHub = inject(CommerceHubService);

  readonly productsResource = resource({
    loader: () => this.adminProductsService.getPendingProducts(),
  });

  actioningId = signal<number | null>(null);
  rejectingId = signal<number | null>(null);
  actionError = signal<string | null>(null);

  constructor() {
    this.commerceHub.joinProductAdminGroup();

    effect(() => {
      if (this.commerceHub.productPendingReview()) {
        this.productsResource.reload();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.commerceHub.leaveProductAdminGroup();
    });
  }

  retry(): void {
    this.productsResource.reload();
  }

  async approve(id: number) {
    this.actioningId.set(id);
    this.actionError.set(null);
    try {
      await this.adminProductsService.approveProduct(id);
      this.productsResource.reload();
    } catch {
      this.actionError.set('Could not approve this product. Please try again.');
    } finally {
      this.actioningId.set(null);
    }
  }

  openReject(id: number): void {
    this.rejectingId.set(id);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
  }

  async confirmReject(id: number, reason: string) {
    if (!reason.trim()) return;
    this.actioningId.set(id);
    this.actionError.set(null);
    try {
      await this.adminProductsService.rejectProduct(id, reason.trim());
      this.rejectingId.set(null);
      this.productsResource.reload();
    } catch {
      this.actionError.set('Could not reject this product. Please try again.');
    } finally {
      this.actioningId.set(null);
    }
  }
}
