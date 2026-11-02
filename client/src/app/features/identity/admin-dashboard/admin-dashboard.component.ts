import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AccountService } from '../../../core/services/identity/account';
import { ProfileService } from '../../../core/services/identity/profile';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { PendingProductsComponent } from './pending-products/pending-products.component';
import { selectPendingCount } from './store/pending-products.selectors';
import { Store } from '@ngrx/store';
import { CommerceHubService } from '../../../core/services/commerce/commerce-hub';
import { PendingProductsActions } from './store/pending-products.actions';

@Component({
  selector: 'app-admin-dashboard',
  imports: [MatTab, MatTabGroup, PendingProductsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css',
})
export class AdminDashboardComponent implements OnInit {
  private accountService = inject(AccountService);
  private profileService = inject(ProfileService);
  private commerceHub = inject(CommerceHubService);
  private store = inject(Store);

  protected pendingCount = this.store.selectSignal(selectPendingCount);

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

  constructor() {
    // The dashboard owns the shared state, so it owns the hub group and the initial load
    this.store.dispatch(PendingProductsActions.load());
    this.commerceHub.joinProductAdminGroup();

    inject(DestroyRef).onDestroy(() => {
      this.commerceHub.leaveProductAdminGroup();
    });
  }

  async ngOnInit() {
    try {
      const profile = await this.profileService.getMyProfile();
      this.photoUrl.set(profile.pictureUrl);
    } catch {
      // stays null — initials fallback covers it, not worth surfacing an error for an avatar
    }
  }
}
