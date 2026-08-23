import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AccountService } from '../../../core/services/identity/account';
import { SellerProfileComponent } from './seller-profile/seller-profile.component';
import { ProfileService } from '../../../core/services/identity/profile';
import { SellerProfile } from '../../../shared/models/commerce/seller-profile';
import { BuyerProfileComponent } from './buyer-profile/buyer-profile.component';
import { AccountRoles } from '../../../shared/models/identity/account-roles';
import { UserProfileDto } from '../../../shared/models/identity/profile';

@Component({
  selector: 'app-profile',
  imports: [SellerProfileComponent, BuyerProfileComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent implements OnInit {
  protected accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  readonly accountRoles = AccountRoles;

  protected readonly role = computed<string>(() => {
    if (this.accountService.currentUser()?.roles.includes(this.accountRoles.Seller)) {
      return this.accountRoles.Seller;
    }
    return this.accountRoles.Buyer;
  });

  protected profile = signal<UserProfileDto | null>(null);

/*   constructor() {
    this.profileService.getMyProfile().subscribe((profile) => {
      if (this.role() === this.accountRoles.Seller)
        this.sellerProfile.set(profile as SellerProfile);
    });
  } */

  async ngOnInit() {
    const profile = await this.profileService.getMyProfile();
    this.profile.set(profile as UserProfileDto);
  }
}
