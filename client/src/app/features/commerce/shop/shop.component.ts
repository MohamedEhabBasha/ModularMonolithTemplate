import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ShopService } from '../../../core/services/commerce/shop';
import { Product } from '../../../shared/models/commerce/products/product';
import { ShopCarouselComponent } from './shop-carousel/shop-carousel.component';
import { FilterSidenavComponent } from './filter-sidenav/filter-sidenav.component';
import { ProductItemComponent } from './product-item/product-item.component';
import { ShopParams } from '../../../shared/models/commerce/shopParams ';
import { MatIcon } from '@angular/material/icon';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Pagination } from '../../../shared/models/Pagination';
import { MatDialog } from '@angular/material/dialog';
import { FilterDialogMobileComponent } from './filter-dialog-mobile/filter-dialog-mobile.component';
import { MarqueeComponent } from './marquee/marquee.component';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';

export interface FilterState {
  search: string;
  types: string[];
  brands: string[];
  sort: 'name' | 'priceAsc' | 'priceDesc';
}

@Component({
  selector: 'app-shop',
  imports: [
    MatIcon,
    ShopCarouselComponent,
    FilterSidenavComponent,
    ProductItemComponent,
    MatPaginatorModule,
    MarqueeComponent,
    EmptyStateComponent,
  ],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css',
})
export class ShopComponent implements OnInit {
  protected shopService = inject(ShopService);
  private dialog = inject(MatDialog);

  products = signal<Pagination<Product>>({
    items: [],
    pageIndex: 0,
    pageSize: 0,
    totalCount: 0,
    totalPages: 0,
  });
  totalCount = signal(0);
  totalProducts = computed(() => this.products().totalCount);

  shopParams = new ShopParams();
  readonly pageSizeOptions = [8, 12, 24, 48];

  ngOnInit(): void {
    this.initialiseShop();
  }

  initialiseShop() {
    this.shopService.getTypes();
    this.shopService.getBrands();
    this.getProducts();
  }

  getProducts() {
    this.shopService.getProducts(this.shopParams).subscribe({
      next: (response) => {
        this.products.set(response);
        console.log('Products fetched:', this.products());
        this.totalCount.set(response.totalCount);
      },
      error: (error) => console.log(error),
    });
  }

  onFiltersChange(filters: FilterState): void {
    this.shopParams.types = filters.types;
    this.shopParams.brands = filters.brands;
    this.shopParams.sort = filters.sort;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onSearchApply(search: string): void {
    this.shopParams.search = search;
    this.shopParams.pageNumber = 1;
    this.getProducts();
  }

  onPageChange(event: PageEvent): void {
    this.shopParams.pageNumber = event.pageIndex + 1;
    this.shopParams.pageSize = event.pageSize;
    this.getProducts();
  }

  openFilterDialog(): void {
    const ref = this.dialog.open(FilterDialogMobileComponent, {
      width: '480px',
      maxWidth: '95vw',
      data: {
        allTypes: this.shopService.types(),
        allBrands: this.shopService.brands(),
      },
      autoFocus: false,
    });

    ref.afterClosed().subscribe((result?: { type: 'filters' | 'search'; payload: any }) => {
      if (!result) return;
      if (result.type === 'filters') {
        this.onFiltersChange(result.payload);
      } else {
        this.onSearchApply(result.payload);
      }
    });
  }
}
