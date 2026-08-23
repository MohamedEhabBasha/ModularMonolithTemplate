import { Component, computed, inject, input } from '@angular/core';
import { ProfileLayoutComponent } from '../profile-layout/profile-layout.component';
import { MatTabsModule } from '@angular/material/tabs';
import { UserProfileDto } from '../../../../shared/models/identity/profile';
import { AccountService } from '../../../../core/services/identity/account';

@Component({
  selector: 'app-buyer-profile',
  imports: [ProfileLayoutComponent, MatTabsModule],
  templateUrl: './buyer-profile.component.html',
  styleUrl: './buyer-profile.component.css',
})
export class BuyerProfileComponent {
  buyerProfile = input<UserProfileDto | null>(null);
  protected accountService = inject(AccountService);

  protected isOwner = computed(() => {
    const buyer = this.buyerProfile();
    const currentUser = this.accountService.currentUser();
    return !!buyer && !!currentUser && buyer.id === currentUser.id;
  });
}
