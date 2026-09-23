import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { BusyService } from '../../core/services/busy-service';
import { MatProgressBar } from '@angular/material/progress-bar';
import { CartService } from '../../core/services/commerce/cart';
import { WishlistService } from '../../core/services/commerce/wishlist';
import { AccountService } from '../../core/services/identity/account';
import { MatDivider } from '@angular/material/divider';
import { AccountRoles } from '../../shared/models/identity/account-roles';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DotHoverDirective } from './demo-navbar/dot-hover';

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
    MatDivider,
    DotHoverDirective
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  private readonly destroyRef = inject(DestroyRef);
  protected readonly busyService = inject(BusyService);
  protected readonly cartService = inject(CartService);
  protected readonly wishlistService = inject(WishlistService);
  protected readonly accountService = inject(AccountService);
  private router = inject(Router);
  protected readonly isMenuOpen = signal(false);
  readonly accountRoles = AccountRoles;

  private readonly navbarRef = viewChild.required<ElementRef<HTMLElement>>('navbar');

  constructor() {
    afterNextRender(() => {
      const nav = this.navbarRef().nativeElement;
      const navHeight = nav.offsetHeight;

      const trigger = ScrollTrigger.create({
        start: 'top top',
        end: 'max',
        onUpdate: (self) => {
          if (this.isMenuOpen()) return; // keep the navbar visible while the mobile menu is open

          const scrollingDown = self.direction === 1 && self.scroll() > navHeight;
          gsap.to(nav, {
            yPercent: scrollingDown ? -100 : 0,
            duration: 0.3,
            ease: 'power2.inOut',
            overwrite: true,
          });
        },
      });

      this.destroyRef.onDestroy(() => trigger.kill());
    });
  }

  async logout() {
    await this.accountService.logout();
    this.router.navigateByUrl('/shop');
  }

  protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
    if (this.isMenuOpen()) {
      gsap.to(this.navbarRef().nativeElement, {
        yPercent: 0,
        duration: 0.3,
        ease: 'power2.inOut',
        overwrite: true,
      });
    }
  }

  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
