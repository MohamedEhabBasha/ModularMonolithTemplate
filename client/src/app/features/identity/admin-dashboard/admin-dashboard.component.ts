import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { AccountService } from '../../../core/services/identity/account';
import { ProfileService } from '../../../core/services/identity/profile';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PendingProductsComponent } from "./pending-products/pending-products.component";

@Component({
  selector: 'app-admin-dashboard',
  imports: [MatTab, MatTabGroup, PendingProductsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);

  protected fullName = computed(() => {
    const user = this.accountService.currentUser();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  protected initials = computed(() => {
    const user = this.accountService.currentUser();
    if (!user) return '';
    return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase();
  });

  protected photoUrl = signal<string | null>(null);

  async ngOnInit() {
    try {
      const profile = await this.profileService.getMyProfile();
      this.photoUrl.set(profile.pictureUrl);
    } catch {
      // stays null — initials fallback covers it, not worth surfacing an error for an avatar
    }
  }
}
