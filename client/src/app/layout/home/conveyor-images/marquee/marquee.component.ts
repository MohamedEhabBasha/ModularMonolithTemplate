import {
  Component,
  ElementRef,
  viewChild,
  viewChildren,
  afterNextRender,
  PLATFORM_ID,
  inject,
  input,
  computed,
  signal,
  DestroyRef,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

export interface ConveyorImage {
  src: string;
  alt: string;
}

@Component({
  selector: 'app-marquee',
  imports: [],
  templateUrl: './marquee.component.html',
  styleUrl: './marquee.component.css',
})
export class MarqueeComponent {
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);

  images = input<ConveyorImage[]>([]);
  speed = input<number>(20);

  readonly slotRatios = [5, 5, 5];
  readonly aspectRatio = 1.4;

  // windowUnit is back-solved from the row's real content width (see updateWindowUnit).
  // Bumped up from the previous 42–85 range so the fan reads as genuinely large on desktop.
  private static readonly MIN_UNIT = 60;
  private static readonly MAX_UNIT = 140;
  // How much the side slots tuck under the middle, expressed in the same units as slotRatios.
  private static readonly OVERLAP_UNITS = 1.5;
  // Keeps the original 400/85 frame-to-window crop proportion at every size.
  private static readonly FRAME_TO_UNIT_RATIO = 480 / 85;
  private static readonly SIDE_ROTATION_DEG = 12;

  private readonly windowUnit = signal(MarqueeComponent.MAX_UNIT);

  readonly frameWidth = computed(
    () => this.windowUnit() * MarqueeComponent.FRAME_TO_UNIT_RATIO,
  );

  readonly overlapPx = computed(
    () => this.windowUnit() * MarqueeComponent.OVERLAP_UNITS,
  );

  readonly slots = computed(() => {
    const unit = this.windowUnit();
    return this.slotRatios.map((ratio) => {
      const width = ratio * unit;
      return { width, height: width / this.aspectRatio };
    });
  });

  strip = computed<ConveyorImage[]>(() => {
    const currentImages = this.images();
    return [...currentImages, ...currentImages];
  });

  private row = viewChild<ElementRef<HTMLDivElement>>('marqueeRow');
  private slotWrappers = viewChildren<ElementRef<HTMLDivElement>>('marqueeSlot');
  private strips = viewChildren<ElementRef<HTMLDivElement>>('conveyorStrip');

  private tweens: gsap.core.Tween[] = [];
  private resizeObserver?: ResizeObserver;
  private resizeTimeout: any;

  constructor() {
    afterNextRender(() => {
      if (!isPlatformBrowser(this.platformId)) return;

      this.updateWindowUnit();
      this.initConveyor();
      this.playEntrance();

      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
          this.updateWindowUnit();
          this.initConveyor();
        }, 150);
      });

      const rowEl = this.row()?.nativeElement;
      if (rowEl) this.resizeObserver.observe(rowEl);

      this.destroyRef.onDestroy(() => {
        this.resizeObserver?.disconnect();
        clearTimeout(this.resizeTimeout);
        this.tweens.forEach((t) => t.kill());
      });
    });
  }

  // Reads the row's real content width — clientWidth minus its own live padding —
  // and back-solves windowUnit from it, accounting for how much the overlap eats in.
  private updateWindowUnit() {
    const rowEl = this.row()?.nativeElement;
    if (!rowEl) return;

    const styles = getComputedStyle(rowEl);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const availableWidth = rowEl.clientWidth - paddingLeft - paddingRight;

    const totalRatioUnits = this.slotRatios.reduce((sum, ratio) => sum + ratio, 0);
    const effectiveUnits = totalRatioUnits - MarqueeComponent.OVERLAP_UNITS * 2;
    const rawUnit = availableWidth / effectiveUnits;

    const unit = Math.min(
      MarqueeComponent.MAX_UNIT,
      Math.max(MarqueeComponent.MIN_UNIT, rawUnit),
    );
    this.windowUnit.set(unit);
  }

  // Spreads each slot's starting offset evenly across the image strip so no
  // two slots ever show the same image at once — works for any slot/image count.
  private computeStartOffsets(slotCount: number, imageCount: number): number[] {
    if (imageCount === 0) return [];
    return Array.from({ length: slotCount }, (_, i) =>
      Math.round((i * imageCount) / slotCount) % imageCount,
    );
  }

  private initConveyor() {
    const stripElements = this.strips().map((el) => el.nativeElement);
    const imageCount = this.images().length;
    if (!stripElements.length || imageCount === 0) return;

    this.tweens.forEach((t) => t.kill());
    this.tweens = [];

    const frameWidth = this.frameWidth();
    const moveDistance = imageCount * frameWidth;
    const duration = moveDistance / this.speed();
    const timePerImage = duration / imageCount;
    const startOffsets = this.computeStartOffsets(stripElements.length, imageCount);

    stripElements.forEach((strip, index) => {
      const tween = gsap.fromTo(
        strip,
        { x: 0 },
        { x: -moveDistance, duration, ease: 'none', repeat: -1 },
      );

      tween.time(startOffsets[index] * timePerImage);
      this.tweens.push(tween);
    });
  }

  private rotationForIndex(index: number): number {
    if (index === 0) return -MarqueeComponent.SIDE_ROTATION_DEG;
    if (index === this.slotRatios.length - 1) return MarqueeComponent.SIDE_ROTATION_DEG;
    return 0;
  }

  // One orchestrated reveal for the whole row, played once on mount.
  private playEntrance() {
    const slotEls = this.slotWrappers().map((el) => el.nativeElement);
    if (!slotEls.length) return;

    // Persistent tilt — set once, separate from the tween below, so the fade/scale
    // animation (which GSAP tracks as its own transform components) never touches it.
    gsap.set(slotEls, {
      transformOrigin: 'bottom center',
      rotation: (i: number) => this.rotationForIndex(i),
    });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.set(slotEls, { autoAlpha: 0, y: 24, scale: 0.94 });
    gsap.to(slotEls, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.9,
      ease: 'power3.out',
      stagger: { each: 0.12, from: 'center' },
    });
  }

  protected slotClass(index: number): string {
    return index === 1
      ? 'shadow-[0_25px_50px_-12px_rgba(82,5,3,0.5)] z-10'
      : 'shadow-2xl';
  }
}