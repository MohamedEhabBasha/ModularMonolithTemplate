// cta.component.ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  afterNextRender,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PixelGlitchComponent } from '../pixel-glitch/pixel-glitch.component';
import { RouterLink } from '@angular/router';

interface CtaImage {
  src: string;
  alt: string;
  /** Badge label that "delivers" this image's addition. Omit on the base image. */
  feature?: string;
}

interface PixelGlitchSpot {
  readonly id: number;
  readonly topPct: number;
  readonly leftPct: number;
  readonly sizePx: number;
  readonly color: string;
}

@Component({
  selector: 'app-cta',
  standalone: true,
  imports: [PixelGlitchComponent, RouterLink],
  templateUrl: './cta.component.html',
  styleUrl: './cta.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaComponent {
  protected readonly linkedinUrl = 'https://www.linkedin.com/in/mohamed-ehab-102341231/';
  protected readonly images: CtaImage[] = [
    { src: 'home/cta-image-5.avif', alt: '' },
    { src: 'home/cta-image-6.avif', alt: '', feature: 'Culture' },
    { src: 'home/cta-image-7.avif', alt: '', feature: 'EXPRESSION' },
  ];

  // The whole pin/scrub/glitch/wheel sequence only initializes at this breakpoint
  // and above — matches Tailwind's default `lg` (1024px). If tailwind.config
  // customizes breakpoints, update this string to match.
  private static readonly BREAKPOINT_LG = '(min-width: 1024px)';

  private static readonly REVEAL_DURATION = 1;
  private static readonly SCRUB_START = 'top top';
  private static readonly SCRUB_AMOUNT = 1;

  // Dwell time (same units as REVEAL_DURATION) inserted after each transition
  // finishes, before the next one starts.
  private static readonly HOLD_DURATION = 0.6;

  // Scroll distance (vh%) allocated per unit of timeline duration.
  private static readonly SCROLL_VH_PER_UNIT = 150;

  // Sweep geometry: angle runs -90° (bottom) → +90° (top). cos(angle) drives both
  // the inward bulge and the opacity, so a badge is only visible passing through center.
  private static readonly WHEEL_VERTICAL_RATIO = 0.55;
  private static readonly WHEEL_HORIZONTAL_RATIO = 0.8;
  private static readonly WHEEL_ROTATION_FACTOR = 0.0;
  private static readonly WHEEL_MIN_SCALE = 0.82;

  // Shared debounce for both resize-driven side effects below: the wheel's own
  private static readonly RESIZE_DEBOUNCE_MS = 150;

  private static readonly GLITCH_BASE_FREQUENCY_REST = 0.015;
  private static readonly GLITCH_BASE_FREQUENCY_PEAK = 0.09;
  private static readonly GLITCH_DISPLACEMENT_PEAK = 60;
  private static readonly GLITCH_ENVELOPE_IN = 0.18;
  private static readonly GLITCH_ENVELOPE_OUT = 0.22;
  private static readonly GLITCH_CROSSFADE_DURATION = 0.35;
  private static readonly GLITCH_RESEED_STEPS = 5;
  private static readonly GLITCH_RGB_SHIFT_PEAK = 6;

  private static readonly FEATURE_GLITCH_REPEAT_DELAY_MIN = 1.2;
  private static readonly FEATURE_GLITCH_REPEAT_DELAY_MAX = 2.6;
  private static readonly FEATURE_GLITCH_SKEW = 14;
  private static readonly FEATURE_GLITCH_SPLIT_OFFSET = 6;
  private static readonly FEATURE_GLITCH_SCALE_BUMP = 1.08;

  private static readonly PIXEL_GLITCH_ZONES: readonly {
    top: [number, number];
    left: [number, number];
  }[] = [
    { top: [6, 11], left: [30, 36] },
    { top: [8, 13], left: [90, 95] },
    { top: [48, 53], left: [3, 7] },
    { top: [80, 86], left: [88, 94] },
    { top: [88, 93], left: [20, 26] },
  ];
  private static readonly PIXEL_GLITCH_COLORS: readonly string[] = ['#00e1ff', '#ff2d5f'];
  private static readonly PIXEL_GLITCH_SIZE_RANGE: readonly [number, number] = [18, 32];

  // Derived from images so the badge list can never drift out of sync with the frames.
  protected readonly features: string[] = this.images
    .map((image) => image.feature)
    .filter((feature): feature is string => !!feature);

  // Computed once per instance — each zone gets one randomized spot.
  protected readonly pixelGlitchSpots: readonly PixelGlitchSpot[] =
    CtaComponent.PIXEL_GLITCH_ZONES.map((zone, id) => ({
      id,
      topPct: gsap.utils.random(zone.top[0], zone.top[1]),
      leftPct: gsap.utils.random(zone.left[0], zone.left[1]),
      sizePx: Math.round(
        gsap.utils.random(
          CtaComponent.PIXEL_GLITCH_SIZE_RANGE[0],
          CtaComponent.PIXEL_GLITCH_SIZE_RANGE[1],
        ),
      ),
      color:
        CtaComponent.PIXEL_GLITCH_COLORS[
          Math.floor(Math.random() * CtaComponent.PIXEL_GLITCH_COLORS.length)
        ],
    }));

  /** Emitted on Join Now click. Left as an output rather than a routerLink so
   * this component stays free of routing assumptions — wire it up from the parent. */
  @Output() readonly joinNow = new EventEmitter<void>();

  private static instanceCounter = 0;
  // Unique per instance so multiple CtaComponents on one page never collide on
  // the same SVG filter id.
  protected readonly filterId = `cta-glitch-filter-${CtaComponent.instanceCounter++}`;
  protected readonly glitchBaseFrequencyRest = CtaComponent.GLITCH_BASE_FREQUENCY_REST;

  private readonly revealRef = viewChild.required<ElementRef<HTMLElement>>('imageReveal');
  private readonly ctaContainerRef = viewChild.required<ElementRef<HTMLElement>>('ctaContainer');
  private readonly framesWrapperRef =
    viewChild.required<ElementRef<HTMLDivElement>>('framesWrapper');
  private readonly turbulenceRef =
    viewChild.required<ElementRef<SVGFETurbulenceElement>>('turbulence');
  private readonly displacementRef =
    viewChild.required<ElementRef<SVGFEDisplacementMapElement>>('displacement');
  private readonly featureWheelRef = viewChild.required<ElementRef<HTMLDivElement>>('featureWheel');
  private readonly featureRectRefs = viewChildren<ElementRef<HTMLDivElement>>('featureRect');
  private readonly glitchBadgeRefs = viewChildren<ElementRef<HTMLDivElement>>('glitchBadge');
  private readonly glitchTopRefs = viewChildren<ElementRef<HTMLSpanElement>>('glitchTop');
  private readonly glitchBottomRefs = viewChildren<ElementRef<HTMLSpanElement>>('glitchBottom');

  private readonly destroyRef = inject(DestroyRef);
  private mm?: gsap.MatchMedia;

  // ---- Feature wheel state ----
  private featureRectEls: HTMLDivElement[] = [];
  private readonly wheelProgress = { value: 0 };
  private wheelVerticalRadius = 0;
  private wheelHorizontalRadius = 0;
  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: ReturnType<typeof setTimeout>;


  private containerResizeObserver?: ResizeObserver;
  private containerResizeTimeout?: ReturnType<typeof setTimeout>;

  private static hasRegisteredScrollTrigger = false;

  constructor() {
    afterNextRender(() => this.createRevealSequence());

    this.destroyRef.onDestroy(() => {
      this.mm?.revert();
    });
  }

  protected onJoinNow(): void {
    this.joinNow.emit();
  }

  private createRevealSequence(): void {
    if (!CtaComponent.hasRegisteredScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      CtaComponent.hasRegisteredScrollTrigger = true;
    }

    const container = this.revealRef().nativeElement;
    const ctaContainer = this.ctaContainerRef().nativeElement;

    this.mm = gsap.matchMedia();

    this.mm.add(CtaComponent.BREAKPOINT_LG, () => {
      this.featureRectEls = this.featureRectRefs().map((r) => r.nativeElement);
      this.measureWheel();
      this.observeWheelResize();
      this.initFeatureGlitch();

      const frames = gsap.utils.selector(container)('.cta-reveal__frame') as HTMLElement[];

      frames.forEach((frame, index) => {
        gsap.set(frame, { autoAlpha: index === 0 ? 1 : 0 });
      });

      const framesWrapper = this.framesWrapperRef().nativeElement;

      // No `invalidateOnRefresh` here: nothing in this timeline is measurement-
      // dependent (the only viewport-derived values are the wheel radii, handled
      // by the ResizeObserver below). Invalidating on resize would re-record the
      // frame tweens' start values from whatever the DOM looks like at that
      // scroll position, killing the crossfades on the way back up.
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: ctaContainer,
          start: CtaComponent.SCRUB_START,
          end: 'bottom bottom',
          scrub: CtaComponent.SCRUB_AMOUNT,
        },
      });

      frames.forEach((frame, index) => {
        if (index === 0) return;

        const label = `reveal-${index}`;
        const labelPosition =
          (index - 1) * (CtaComponent.REVEAL_DURATION + CtaComponent.HOLD_DURATION);
        timeline.addLabel(label, labelPosition);

        timeline.set(framesWrapper, { filter: this.frameFilterStyle }, label);
        this.addGlitchBurst(timeline, label, frames[index - 1], frame);
        timeline.set(
          framesWrapper,
          { filter: 'none' },
          `${label}+=${CtaComponent.REVEAL_DURATION}`,
        );

        timeline.fromTo(
          this.wheelProgress,
          { value: index - 1 },
          {
            value: index,
            duration: CtaComponent.REVEAL_DURATION,
            onUpdate: () => this.updateWheel(),
          },
          label,
        );
      });

      this.updateWheel(); 

      timeline.to({}, { duration: 1 });

      this.observeContainerResize(ctaContainer);

      return () => {
        this.resizeObserver?.disconnect();
        clearTimeout(this.resizeTimeout);
        this.containerResizeObserver?.disconnect();
        clearTimeout(this.containerResizeTimeout);
      };
    });
  }

  private addGlitchBurst(
    timeline: gsap.core.Timeline,
    label: string,
    prevFrame: HTMLElement,
    nextFrame: HTMLElement,
  ): void {
    const turbulence = this.turbulenceRef().nativeElement;
    const displacement = this.displacementRef().nativeElement;
    const framesWrapper = this.framesWrapperRef().nativeElement;

    const plateauStart = CtaComponent.GLITCH_ENVELOPE_IN;
    const plateauEnd = CtaComponent.REVEAL_DURATION - CtaComponent.GLITCH_ENVELOPE_OUT;
    const plateauSpan = plateauEnd - plateauStart;
    const stepDuration = plateauSpan / CtaComponent.GLITCH_RESEED_STEPS;

    timeline.to(
      displacement,
      { attr: { scale: CtaComponent.GLITCH_DISPLACEMENT_PEAK }, duration: plateauStart },
      label,
    );
    timeline.to(
      turbulence,
      { attr: { baseFrequency: CtaComponent.GLITCH_BASE_FREQUENCY_PEAK }, duration: plateauStart },
      label,
    );

    const crossfadeDuration = Math.min(CtaComponent.GLITCH_CROSSFADE_DURATION, plateauSpan);
    const crossfadePosition = `${label}+=${plateauStart.toFixed(3)}`;

    // fromTo with immediateRender:false — explicit endpoints survive any future
    // invalidate(), and deferring render keeps the initial gsap.set() above as the
    // source of truth until the playhead actually reaches this tween.
    timeline.fromTo(
      prevFrame,
      { autoAlpha: 1 },
      { autoAlpha: 0, duration: crossfadeDuration, immediateRender: false },
      crossfadePosition,
    );
    timeline.fromTo(
      nextFrame,
      { autoAlpha: 0 },
      { autoAlpha: 1, duration: crossfadeDuration, immediateRender: false },
      crossfadePosition,
    );

    for (let step = 0; step < CtaComponent.GLITCH_RESEED_STEPS; step++) {
      const position = `${label}+=${(plateauStart + step * stepDuration).toFixed(3)}`;

      timeline.set(
        turbulence,
        { attr: { seed: () => Math.round(gsap.utils.random(1, 999)) } },
        position,
      );
      timeline.set(
        framesWrapper,
        {
          '--rgb-shift': () =>
            gsap.utils.random(
              -CtaComponent.GLITCH_RGB_SHIFT_PEAK,
              CtaComponent.GLITCH_RGB_SHIFT_PEAK,
            ),
        },
        position,
      );
    }

    timeline.to(
      displacement,
      { attr: { scale: 0 }, duration: CtaComponent.GLITCH_ENVELOPE_OUT },
      `${label}+=${plateauEnd.toFixed(3)}`,
    );
    timeline.to(
      turbulence,
      {
        attr: { baseFrequency: CtaComponent.GLITCH_BASE_FREQUENCY_REST },
        duration: CtaComponent.GLITCH_ENVELOPE_OUT,
      },
      `${label}+=${plateauEnd.toFixed(3)}`,
    );
    timeline.to(
      framesWrapper,
      { '--rgb-shift': 0, duration: CtaComponent.GLITCH_ENVELOPE_OUT },
      `${label}+=${plateauEnd.toFixed(3)}`,
    );
  }

  private updateWheel(): void {
    const p = this.wheelProgress.value;

    for (let i = 0; i < this.featureRectEls.length; i++) {
      const t = Math.min(1, Math.max(0, p - i));
      const angle = -Math.PI / 2 + t * Math.PI;
      const sinA = Math.sin(angle);
      const cosA = Math.cos(angle);

      const y = -sinA * this.wheelVerticalRadius;
      const x = cosA * this.wheelHorizontalRadius;
      const rotZ = angle * (180 / Math.PI) * CtaComponent.WHEEL_ROTATION_FACTOR;
      const scale = CtaComponent.WHEEL_MIN_SCALE + (1 - CtaComponent.WHEEL_MIN_SCALE) * cosA;

      const el = this.featureRectEls[i];
      el.style.transform = `translate3d(${x}px, ${y}px, 0) rotateZ(${rotZ}deg) scale(${scale})`;
      el.style.opacity = cosA.toString();
    }
  }

  private measureWheel(): void {
    const el = this.featureWheelRef().nativeElement;
    this.wheelVerticalRadius = el.clientHeight * CtaComponent.WHEEL_VERTICAL_RATIO;
    this.wheelHorizontalRadius = el.clientWidth * CtaComponent.WHEEL_HORIZONTAL_RATIO;
  }

  private observeWheelResize(): void {
    const el = this.featureWheelRef().nativeElement;
    this.resizeObserver = new ResizeObserver(() => {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(() => {
        this.measureWheel();
        this.updateWheel();
      }, CtaComponent.RESIZE_DEBOUNCE_MS);
    });
    this.resizeObserver.observe(el);
  }


  private observeContainerResize(container: HTMLElement): void {
    this.containerResizeObserver = new ResizeObserver(() => {
      clearTimeout(this.containerResizeTimeout);
      this.containerResizeTimeout = setTimeout(() => {
        //ScrollTrigger.refresh(true);
      }, CtaComponent.RESIZE_DEBOUNCE_MS);
    });
    this.containerResizeObserver.observe(container);
  }

  private initFeatureGlitch(): void {
    const badgeEls = this.glitchBadgeRefs().map((r) => r.nativeElement);
    const topEls = this.glitchTopRefs().map((r) => r.nativeElement);
    const bottomEls = this.glitchBottomRefs().map((r) => r.nativeElement);

    badgeEls.forEach((badge, i) => {
      const top = topEls[i];
      const bottom = bottomEls[i];
      if (!top || !bottom) return;

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: gsap.utils.random(
          CtaComponent.FEATURE_GLITCH_REPEAT_DELAY_MIN,
          CtaComponent.FEATURE_GLITCH_REPEAT_DELAY_MAX,
        ),
        defaults: { ease: 'power4.inOut' },
      });

      tl.to([top, bottom], { duration: 0.08, skewX: CtaComponent.FEATURE_GLITCH_SKEW })
        .to([top, bottom], { duration: 0.04, skewX: 0 })
        .to([top, bottom], { duration: 0.03, autoAlpha: 0 })
        .to([top, bottom], { duration: 0.03, autoAlpha: 1 })
        .to([top, bottom], { duration: 0.04, x: -CtaComponent.FEATURE_GLITCH_SPLIT_OFFSET })
        .to([top, bottom], { duration: 0.04, x: 0 })
        .addLabel('split')
        .to(top, { duration: 0.3, x: -CtaComponent.FEATURE_GLITCH_SPLIT_OFFSET / 2 }, 'split')
        .to(bottom, { duration: 0.3, x: CtaComponent.FEATURE_GLITCH_SPLIT_OFFSET / 2 }, 'split')
        .call(() => top.classList.add('feature-badge__slice--glitch-cyan'), [], 'split')
        .call(() => bottom.classList.add('feature-badge__slice--glitch-magenta'), [], 'split')
        .to(badge, { duration: 0.02, scaleY: CtaComponent.FEATURE_GLITCH_SCALE_BUMP }, 'split')
        .to(badge, { duration: 0.04, scaleY: 1 }, '+=0.02')
        .call(
          () => {
            top.classList.remove('feature-badge__slice--glitch-cyan');
            bottom.classList.remove('feature-badge__slice--glitch-magenta');
          },
          [],
          '+=0.05',
        )
        .to([top, bottom], { duration: 0.1, x: 0 });

      tl.progress(gsap.utils.random(0, 1)).play();
    });
  }
  
  private readonly frameFilterStyle =
    `url(#${this.filterId}) ` +
    `drop-shadow(calc(var(--rgb-shift, 0) * -1px) 0 rgba(255,40,70,.55)) ` +
    `drop-shadow(calc(var(--rgb-shift, 0) * 1px) 0 rgba(0,230,255,.55))`;
}