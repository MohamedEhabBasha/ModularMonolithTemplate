import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './layout/navbar/navbar.component';
import { PreloaderReadyService } from './core/services/preloader-ready';
import { InitService } from './core/services/init';
import { PreloaderComponent } from "./layout/preloader/preloader.component";
import { FooterComponent } from './layout/footer/footer.component';
import { DemoNavbarComponent } from './layout/navbar/demo-navbar/demo-navbar.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet/* , NavbarComponent */, PreloaderComponent, FooterComponent, DemoNavbarComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('mwgoods');
  protected readonly showPreloader = signal(true);
  private readonly initService = inject(InitService);
  private readonly preloaderReady = inject(PreloaderReadyService);

  constructor() {
    this.initService.init().subscribe({
      next: () => this.preloaderReady.initializationDone(),
      error: () => this.preloaderReady.initializationDone(),
    });

    effect(() => {
      if (this.preloaderReady.dismissed()) {
        this.showPreloader.set(false);
      }
    });
  }
}
