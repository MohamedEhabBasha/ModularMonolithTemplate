import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BusyService } from '../../core/services/busy-service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CartService } from '../../core/services/commerce/cart';
import { AccountService } from '../../core/services/identity/account';
import { MatDivider } from '@angular/material/divider';
import { AccountRoles } from '../../shared/models/identity/account-roles';

@Component({
  selector: 'app-navbar',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive,
    MatProgressBar,
    MatMenuTrigger,
    MatMenuItem,
    MatMenu,
    MatDivider
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly busyService = inject(BusyService);
  protected readonly cartService = inject(CartService);
  protected readonly accountService = inject(AccountService);
  private router = inject(Router);
  protected readonly isMenuOpen = signal(false);
  readonly accountRoles = AccountRoles;

  async logout() {
    await this.accountService.logout();
    console.log(this.accountService.currentUser());
    this.router.navigateByUrl('/shop');
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
