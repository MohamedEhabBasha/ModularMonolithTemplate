import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PreloaderReadyService {
  private readonly animationFinished = signal(false);
  private readonly initializationFinished = signal(false);
  private readonly exitFinished = signal(false);

  readonly readyToDismiss = computed(
    () => this.animationFinished() && this.initializationFinished(),
  );
  readonly dismissed = computed(() => this.exitFinished());

  animationDone(): void {
    this.animationFinished.set(true);
  }
  initializationDone(): void {
    this.initializationFinished.set(true);
  }
  exitDone(): void {
    this.exitFinished.set(true);
  }
}
