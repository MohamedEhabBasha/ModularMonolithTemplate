import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-navbar',
  imports: [MatIconModule, MatButtonModule, MatBadgeModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  protected readonly isMenuOpen = signal(false);

   protected toggleMenu(): void {
    this.isMenuOpen.update((open) => !open);
  }
 
  protected closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
