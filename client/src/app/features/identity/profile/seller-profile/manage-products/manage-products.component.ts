import { Component, computed, DestroyRef, effect, inject, resource, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SellerService } from '../../../../../core/services/identity/seller';
import { CommerceHubService } from '../../../../../core/services/commerce/commerce-hub';
import { SellerProductDto } from '../../../../../shared/models/commerce/products/seller-product';
import { MatIcon } from '@angular/material/icon';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { CurrencyPipe } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatSelect, MatOption } from '@angular/material/select';
import { ProductFormComponent } from '../product-form/product-form.component';

type ProductStatusFilter = 'Pending' | 'Rejected' | 'Approved';

@Component({
  selector: 'app-manage-products',
  imports: [
    MatIcon,
    EmptyStateComponent,
    CurrencyPipe,
    MatButton,
    MatIconButton,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
  ],
  templateUrl: './manage-products.component.html',
  styleUrl: './manage-products.component.css',
})
export class ManageProductsComponent {
  private destroyRef = inject(DestroyRef);
  private sellerService = inject(SellerService);
  private commerceHub = inject(CommerceHubService);
  private dialog = inject(MatDialog);

  readonly productsResource = resource({
    loader: () => this.sellerService.getMyProducts(),
  });

  readonly statusOptions: ProductStatusFilter[] = ['Pending', 'Rejected', 'Approved'];
  statusFilter = signal<ProductStatusFilter>('Pending');

  protected products = computed(() => this.productsResource.value() ?? []);

  statusCounts = computed(() => {
    const counts = { Pending: 0, Rejected: 0, Approved: 0 };
    for (const p of this.products()) counts[p.status]++;
    return counts;
  });

  filteredProducts = computed(() =>
    this.products().filter((p) => p.status === this.statusFilter()),
  );

  deletingId = signal<number | null>(null);
  actionError = signal<string | null>(null);

  constructor() {
    this.commerceHub.joinMySellerProductGroup();

    effect(() => {
      // Any reviewed-product push is guaranteed to be about one of this seller's own
      // products — the SignalR group is already scoped to sellerId server-side.
      if (this.commerceHub.productReviewed()) {
        this.productsResource.reload();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.commerceHub.leaveMySellerProductGroup();
    });
  }

  retry(): void {
    this.productsResource.reload();
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      panelClass: 'create-product-dialog',
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
    });

    dialogRef.afterClosed().subscribe((product) => {
      if (product) this.productsResource.reload();
    });
  }

  editProduct(product: SellerProductDto): void {
    const dialogRef = this.dialog.open(ProductFormComponent, {
      panelClass: 'create-product-dialog',
      width: '700px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      autoFocus: false,
      data: { product },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.productsResource.reload();
    });
  }

  async deleteProduct(id: number): Promise<void> {
    if (!confirm('Delete this product? This cannot be undone.')) return;

    this.deletingId.set(id);
    this.actionError.set(null);
    try {
      await this.sellerService.deleteProduct(id);
      this.productsResource.reload();
    } catch {
      this.actionError.set('Could not delete this product. Please try again.');
    } finally {
      this.deletingId.set(null);
    }
  }
}
