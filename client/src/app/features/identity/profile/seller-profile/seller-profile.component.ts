import { Component, computed, inject, input } from '@angular/core';
import { ProfileLayoutComponent } from '../profile-layout/profile-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UserProfileDto } from '../../../../shared/models/identity/profile';
import { AccountService } from '../../../../core/services/identity/account';
import { ManageProductsComponent } from "./manage-products/manage-products.component";
import { AboutSellerComponent } from "./about-seller/about-seller.component";

@Component({
  selector: 'app-seller-profile',
  imports: [ProfileLayoutComponent, MatTabsModule, ManageProductsComponent, AboutSellerComponent],
  templateUrl: './seller-profile.component.html',
  styleUrl: './seller-profile.component.css',
})
export class SellerProfileComponent {
  private accountService = inject(AccountService);

  sellerProfile = input<UserProfileDto | null>(null);

  protected isOwner = computed(() => {
    const seller = this.sellerProfile();
    const currentUser = this.accountService.currentUser();
    return !!seller && !!currentUser && seller.id === currentUser.id;
  });

  protected displayName = computed(() => {
    const seller = this.sellerProfile();
    if (!seller) return '';
    if (!seller.brandName || seller.brandName === '')
      return `${seller.firstName} ${seller.lastName}`;
    return this.isOwner() ? `${seller.firstName} ${seller.lastName}` : seller.brandName;
  });
}
