import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { PreloaderReadyService } from '../../core/services/preloader-ready';
import gsap from 'gsap';

@Component({
  selector: 'app-preloader',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './preloader.component.html',
  styleUrl: './preloader.component.css',
})
export class PreloaderComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly preloaderReady = inject(PreloaderReadyService);

  private readonly screenRef = viewChild.required<ElementRef<HTMLDivElement>>('screen');
  private readonly percentRef = viewChild.required<ElementRef<HTMLSpanElement>>('percent');

  protected readonly displayPercent = signal(0);

  private static readonly STEP_DURATION = 0.08;

  private progressTween?: gsap.core.Tween;
  private masterTimeline?: gsap.core.Timeline;

  constructor() {
    afterNextRender(() => this.startProgressAnimation());

    effect(() => {
      if (this.preloaderReady.readyToDismiss()) {
        this.playExitAnimation();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.progressTween?.kill();
      this.masterTimeline?.kill();
    });
  }

  private startProgressAnimation(): void {
    gsap.to(this.percentRef().nativeElement, { opacity: 1, duration: 0.3 });
    this.tickProgress({ value: 0 });
  }

  private tickProgress(state: { value: number }): void {
    if (state.value >= 100) {
      this.displayPercent.set(100);
      this.animationFinished();
      return;
    }

    const step = Math.floor(Math.random() * 10) + 1; // random jump between 1 and 10
    const next = Math.min(100, state.value + step);

    this.progressTween = gsap.to(state, {
      value: next,
      duration: PreloaderComponent.STEP_DURATION,
      ease: 'power1.out',
      onUpdate: () => this.displayPercent.set(Math.round(state.value)),
      onComplete: () => this.tickProgress(state),
    });
  }

  private playExitAnimation(): void {
    const screen = this.screenRef().nativeElement;
    const percent = this.percentRef().nativeElement;

    const tl = gsap.timeline({
      defaults: { ease: 'power4.inOut' },
      onComplete: () => this.preloaderReady.exitDone(),
    });

    this.masterTimeline = tl;

    tl.to(percent, { opacity: 0, y: -8, duration: 0.3, ease: 'power2.in' }).to(screen, {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1,
      ease: 'power4.inOut',
    });
  }

  protected animationFinished(): void {
    gsap.to(this.percentRef().nativeElement, {
      scale: 1.08,
      duration: 0.15,
      ease: 'power2.out',
      yoyo: true,
      repeat: 1,
      onComplete: () => this.preloaderReady.animationDone(),
    });
  }
}
