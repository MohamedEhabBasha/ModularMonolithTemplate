import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { gsap } from 'gsap';
import { PixelGlitchComponent } from '../home/pixel-glitch/pixel-glitch.component';

interface PixelGlitchSpot {
  readonly id: number;
  readonly topPct: number;
  readonly leftPct: number;
  readonly sizePx: number;
  readonly color: string;
}

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, PixelGlitchComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  // Same breakpoint gate used for every ambient/decorative effect elsewhere
  // in this app — matches Tailwind's default `lg` (1024px).
  private static readonly BREAKPOINT_LG = '(min-width: 1024px)';
  protected readonly githubUrl = 'https://github.com/MohamedEhabBasha';
  protected readonly linkedinUrl = 'https://www.linkedin.com/in/mohamed-ehab-102341231/';

  // Distortion envelope on the wordmark — same feTurbulence/feDisplacementMap
  // technique as CtaComponent.addGlitchBurst, but a self-contained pulse
  // rather than a crossfade partner (there's no second frame here).
  private static readonly GLITCH_BASE_FREQUENCY_REST = 0.015;
  private static readonly GLITCH_BASE_FREQUENCY_PEAK = 0.09;
  private static readonly GLITCH_DISPLACEMENT_PEAK = 40;
  private static readonly GLITCH_ENVELOPE_IN = 0.16;
  private static readonly GLITCH_ENVELOPE_OUT = 0.2;
  private static readonly GLITCH_RESEED_STEPS = 4;
  private static readonly GLITCH_RESEED_STEP_DURATION = 0.05;
  private static readonly GLITCH_RGB_SHIFT_PEAK = 5;

  // Tear (top/bottom slice split) — same steps as CtaComponent's ambient
  // badge glitch, layered inside the distortion window above.
  private static readonly GLITCH_SKEW = 12;
  private static readonly GLITCH_SPLIT_OFFSET = 8;
  private static readonly GLITCH_SCALE_BUMP = 1.05;

  // repeat: -1 is correct here — every cycle returns to the same rest state
  // before repeating, so there's no stale-start-value snap-back to worry
  // about (unlike the vase/gaze/pixel-corner loops elsewhere, which advance
  // to a *different* state each cycle and use recursive delayedCall instead).
  private static readonly GLITCH_REPEAT_DELAY_MIN = 3;
  private static readonly GLITCH_REPEAT_DELAY_MAX = 6;

  // Ambient pixel-glitch accents — same component/technique as CtaComponent,
  // zones sized down for a much shorter section.
  private static readonly PIXEL_GLITCH_ZONES: readonly {
    top: [number, number];
    left: [number, number];
  }[] = [
    { top: [8, 14], left: [4, 9] },
    { top: [10, 16], left: [90, 95] },
    { top: [78, 86], left: [55, 62] },
  ];
  private static readonly PIXEL_GLITCH_COLORS: readonly string[] = ['#00e1ff', '#ff2d5f'];
  private static readonly PIXEL_GLITCH_SIZE_RANGE: readonly [number, number] = [16, 26];

  private static instanceCounter = 0;
  // Unique per instance so multiple FooterComponents on one page never
  // collide on the same SVG filter id.
  protected readonly filterId = `footer-glitch-filter-${FooterComponent.instanceCounter++}`;
  private readonly wordmarkFilterStyle =
    `url(#${this.filterId}) ` +
    `drop-shadow(calc(var(--rgb-shift, 0) * -1px) 0 rgba(255,40,70,.55)) ` +
    `drop-shadow(calc(var(--rgb-shift, 0) * 1px) 0 rgba(0,230,255,.55))`;
  protected readonly glitchBaseFrequencyRest = FooterComponent.GLITCH_BASE_FREQUENCY_REST;
  protected readonly currentYear = new Date().getFullYear();

  protected readonly pixelGlitchSpots: readonly PixelGlitchSpot[] =
    FooterComponent.PIXEL_GLITCH_ZONES.map((zone, id) => ({
      id,
      topPct: gsap.utils.random(zone.top[0], zone.top[1]),
      leftPct: gsap.utils.random(zone.left[0], zone.left[1]),
      sizePx: Math.round(
        gsap.utils.random(
          FooterComponent.PIXEL_GLITCH_SIZE_RANGE[0],
          FooterComponent.PIXEL_GLITCH_SIZE_RANGE[1],
        ),
      ),
      color:
        FooterComponent.PIXEL_GLITCH_COLORS[
          Math.floor(Math.random() * FooterComponent.PIXEL_GLITCH_COLORS.length)
        ],
    }));

  private readonly wordmarkWrapperRef =
    viewChild.required<ElementRef<HTMLElement>>('wordmarkWrapper');
  private readonly wordmarkTopRef = viewChild.required<ElementRef<HTMLElement>>('wordmarkTop');
  private readonly wordmarkBottomRef =
    viewChild.required<ElementRef<HTMLElement>>('wordmarkBottom');
  private readonly turbulenceRef =
    viewChild.required<ElementRef<SVGFETurbulenceElement>>('turbulence');
  private readonly displacementRef =
    viewChild.required<ElementRef<SVGFEDisplacementMapElement>>('displacement');

  private readonly destroyRef = inject(DestroyRef);
  private mm?: gsap.MatchMedia;

  constructor() {
    afterNextRender({
      read: () => this.setupWordmarkGlitch(),
    });

    this.destroyRef.onDestroy(() => {
      this.mm?.revert();
    });
  }

  private setupWordmarkGlitch(): void {
    this.mm = gsap.matchMedia();

    this.mm.add(FooterComponent.BREAKPOINT_LG, () => {
      const wrapper = this.wordmarkWrapperRef().nativeElement;

      gsap.set(wrapper, { filter: 'none' });

      const tl = gsap.timeline({
        repeat: -1,
        repeatDelay: gsap.utils.random(
          FooterComponent.GLITCH_REPEAT_DELAY_MIN,
          FooterComponent.GLITCH_REPEAT_DELAY_MAX,
        ),
        defaults: { ease: 'power4.inOut' },
      });

      this.addWordmarkGlitchBurst(tl);

      return () => {
        tl.kill();
      };
    });
  }

  private addWordmarkGlitchBurst(tl: gsap.core.Timeline): void {
    const wrapper = this.wordmarkWrapperRef().nativeElement;
    const top = this.wordmarkTopRef().nativeElement;
    const bottom = this.wordmarkBottomRef().nativeElement;
    const turbulence = this.turbulenceRef().nativeElement;
    const displacement = this.displacementRef().nativeElement;

    const plateauStart = FooterComponent.GLITCH_ENVELOPE_IN;
    const plateauEnd =
      plateauStart +
      FooterComponent.GLITCH_RESEED_STEPS * FooterComponent.GLITCH_RESEED_STEP_DURATION;

    tl.addLabel('burst', 0);

    // Distortion in
    tl.set(wrapper, { filter: this.wordmarkFilterStyle }, 'burst');
    tl.to(
      displacement,
      { attr: { scale: FooterComponent.GLITCH_DISPLACEMENT_PEAK }, duration: plateauStart },
      'burst',
    );
    tl.to(
      turbulence,
      {
        attr: { baseFrequency: FooterComponent.GLITCH_BASE_FREQUENCY_PEAK },
        duration: plateauStart,
      },
      'burst',
    );
    tl.to(
      wrapper,
      { '--rgb-shift': FooterComponent.GLITCH_RGB_SHIFT_PEAK, duration: plateauStart },
      'burst',
    );

    // Reseed while distortion holds at peak — flickering-static look.
    for (let step = 0; step < FooterComponent.GLITCH_RESEED_STEPS; step++) {
      const position = `burst+=${(
        plateauStart +
        step * FooterComponent.GLITCH_RESEED_STEP_DURATION
      ).toFixed(3)}`;
      tl.set(turbulence, { attr: { seed: () => Math.round(gsap.utils.random(1, 999)) } }, position);
      tl.set(
        wrapper,
        {
          '--rgb-shift': () =>
            gsap.utils.random(
              -FooterComponent.GLITCH_RGB_SHIFT_PEAK,
              FooterComponent.GLITCH_RGB_SHIFT_PEAK,
            ),
        },
        position,
      );
    }

    // Tear: top/bottom slices skew, blink, and split apart — same steps as
    // CtaComponent.initFeatureGlitch, layered inside the distortion window.
    tl.to([top, bottom], { skewX: FooterComponent.GLITCH_SKEW, duration: 0.08 }, 'burst+=0.02')
      .to([top, bottom], { skewX: 0, duration: 0.04 })
      .to([top, bottom], { autoAlpha: 0, duration: 0.03 })
      .to([top, bottom], { autoAlpha: 1, duration: 0.03 })
      .to([top, bottom], { x: -FooterComponent.GLITCH_SPLIT_OFFSET, duration: 0.04 })
      .to([top, bottom], { x: 0, duration: 0.04 })
      .addLabel('split')
      .to(top, { x: -FooterComponent.GLITCH_SPLIT_OFFSET / 2, duration: 0.3 }, 'split')
      .to(bottom, { x: FooterComponent.GLITCH_SPLIT_OFFSET / 2, duration: 0.3 }, 'split')
      .call(() => top.classList.add('wordmark__slice--glitch-cyan'), [], 'split')
      .call(() => bottom.classList.add('wordmark__slice--glitch-magenta'), [], 'split')
      .to(wrapper, { scaleY: FooterComponent.GLITCH_SCALE_BUMP, duration: 0.02 }, 'split')
      .to(wrapper, { scaleY: 1, duration: 0.04 }, '+=0.02')
      .call(
        () => {
          top.classList.remove('wordmark__slice--glitch-cyan');
          bottom.classList.remove('wordmark__slice--glitch-magenta');
        },
        [],
        '+=0.05',
      )
      .to([top, bottom], { x: 0, duration: 0.1 });

    // Distortion out
    const outPosition = `burst+=${plateauEnd.toFixed(3)}`;
    tl.to(
      displacement,
      { attr: { scale: 0 }, duration: FooterComponent.GLITCH_ENVELOPE_OUT },
      outPosition,
    );
    tl.to(
      turbulence,
      {
        attr: { baseFrequency: FooterComponent.GLITCH_BASE_FREQUENCY_REST },
        duration: FooterComponent.GLITCH_ENVELOPE_OUT,
      },
      outPosition,
    );
    tl.to(
      wrapper,
      { '--rgb-shift': 0, duration: FooterComponent.GLITCH_ENVELOPE_OUT },
      outPosition,
    );
    tl.set(
      wrapper,
      { filter: 'none' },
      `burst+=${(plateauEnd + FooterComponent.GLITCH_ENVELOPE_OUT).toFixed(3)}`,
    );
  }
}
