import { Component, DestroyRef, effect, inject, resource, signal } from '@angular/core';
import { AdminService } from '../../../../core/services/identity/admin';
import { CommerceHubService } from '../../../../core/services/commerce/commerce-hub';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { CurrencyPipe } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatInput } from '@angular/material/input';
import { Store } from '@ngrx/store';
import {
  selectActionError,
  selectActioningId,
  selectLoadError,
  selectLoading,
  selectProducts,
} from '../store/pending-products.selectors';
import { PendingProductsActions } from '../store/pending-products.actions';
import { Actions, ofType } from '@ngrx/effects';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-pending-products',
  imports: [MatFormField, MatLabel, EmptyStateComponent, CurrencyPipe, MatButton, MatInput],
  templateUrl: './pending-products.component.html',
  styleUrl: './pending-products.component.css',
})
export class PendingProductsComponent {
  private store = inject(Store);

  // Shared state: read from the store
  protected products = this.store.selectSignal(selectProducts);
  protected loading = this.store.selectSignal(selectLoading);
  protected loadError = this.store.selectSignal(selectLoadError);
  protected actioningId = this.store.selectSignal(selectActioningId);
  protected actionError = this.store.selectSignal(selectActionError);

  // Local UI state: stays here
  rejectingId = signal<number | null>(null);

  constructor() {
    // Close the reject box only after the server confirms
    inject(Actions)
      .pipe(ofType(PendingProductsActions.rejectSuccess), takeUntilDestroyed())
      .subscribe(({ id }) => {
        if (this.rejectingId() === id) {
          this.rejectingId.set(null);
        }
      });
  }

  retry(): void {
    this.store.dispatch(PendingProductsActions.load());
  }

  approve(id: number) {
    this.store.dispatch(PendingProductsActions.approve({ id }));
  }

  openReject(id: number): void {
    this.rejectingId.set(id);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
  }

  confirmReject(id: number, reason: string): void {
    if (!reason.trim()) return;
    this.store.dispatch(PendingProductsActions.reject({ id, reason: reason.trim() }));
  }
}
