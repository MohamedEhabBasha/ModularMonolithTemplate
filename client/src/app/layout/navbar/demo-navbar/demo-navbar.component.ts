import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DotHoverDirective } from './dot-hover';

gsap.registerPlugin(ScrollTrigger); // safe no-op if already registered elsewhere

@Component({
  selector: 'app-demo-navbar',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    RouterLink,
    RouterLinkActive,
    DotHoverDirective,
  ],
  templateUrl: './demo-navbar.component.html',
  styleUrl: './demo-navbar.component.css',
})
export class DemoNavbarComponent {
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly isMenuOpen = signal(false);

  private readonly navbarRef = viewChild.required<ElementRef<HTMLElement>>('navbar');

  protected readonly linkedinUrl = 'https://www.linkedin.com/in/mohamed-ehab-102341231/';

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
