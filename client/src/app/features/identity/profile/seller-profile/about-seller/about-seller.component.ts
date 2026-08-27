import { Component, computed, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ShopService } from '../../../../../core/services/commerce/shop';
import { ShopParams } from '../../../../../shared/models/commerce/shopParams ';
import { EmptyStateComponent } from '../../../../../shared/components/empty-state/empty-state.component';
import { ProductItemComponent } from "../../../../commerce/shop/product-item/product-item.component";
import { UserProfileDto } from '../../../../../shared/models/identity/profile';
import { MatPaginator, PageEvent } from "@angular/material/paginator";

@Component({
  selector: 'app-about-seller',
  imports: [EmptyStateComponent, ProductItemComponent, MatPaginator],
  templateUrl: './about-seller.component.html',
  styleUrl: './about-seller.component.css',
})
export class AboutSellerComponent {
  sellerProfile = input.required<UserProfileDto>();

  private shopService = inject(ShopService);

  private pageNumber = signal(1);  

  private shopParams = computed<ShopParams>(() => {
    const sp = new ShopParams();
    sp.sellerId = this.sellerProfile().id;
    sp.pageNumber = this.pageNumber();
    return sp;
  })



  readonly productsResource = rxResource({
    params: () => ({ shopParams: this.shopParams() }),
    stream: ({ params }) => this.shopService.getProducts(params.shopParams),
  });

  onPageChange(event: PageEvent): void {
    this.pageNumber.set(event.pageIndex + 1);
    this.productsResource.reload();
  }

  retry(): void {
    this.productsResource.reload();
  }
}
