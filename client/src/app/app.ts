import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { ShopComponent } from "./features/commerce/shop/shop.component";


@Component({
  selector: 'app-root',
  imports: [/* RouterOutlet, */ NavbarComponent, ShopComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('mwgoods');
}
