import {
  afterNextRender,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { ThreeCanvasHostComponent } from './three-canvas-host/three-canvas-host.component';
import { ThreejsSceneService } from './three-canvas-host/three-js-service/three-js-scene';
import { PreloaderReadyService } from '../../core/services/preloader-ready';
import { JourneyShowcaseComponent } from './journey-showcase/journey-showcase.component';
import { ProductExperienceComponent } from './product-experience/product-experience.component';
import { ProductsShowcaseComponent } from './products-showcase/products-showcase.component';
import { CtaComponent } from './cta/cta.component';
import { ConveyorImagesComponent } from './conveyor-images/conveyor-images.component';

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin);

@Component({
  selector: 'app-home',
  imports: [
    ThreeCanvasHostComponent,
    JourneyShowcaseComponent,
    ProductExperienceComponent,
    ProductsShowcaseComponent,
    CtaComponent,
    ConveyorImagesComponent,
  ],
  providers: [ThreejsSceneService],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly canvasService = inject(ThreejsSceneService);
  private readonly preloaderService = inject(PreloaderReadyService);

  private readonly turnYourWord = viewChild.required<ElementRef<HTMLElement>>('turnYourWord');
  private readonly productsWord = viewChild.required<ElementRef<HTMLElement>>('productsWord');
  private readonly intoAWord = viewChild.required<ElementRef<HTMLElement>>('intoAWord');
  private readonly trustedWord = viewChild.required<ElementRef<HTMLElement>>('trustedWord');
  private readonly businessWord = viewChild.required<ElementRef<HTMLElement>>('businessWord');
  private readonly paragraphText = viewChild.required<ElementRef<HTMLElement>>('paragraphText');
  private readonly drawLinePath = viewChild.required<ElementRef<SVGPathElement>>('drawLinePath');
  private readonly vaseGlyph = viewChild.required<ElementRef<SVGSVGElement>>('vaseGlyph');
  private readonly sellerCard = viewChild.required<ElementRef<HTMLElement>>('sellerCard');
  private readonly buyerCard = viewChild.required<ElementRef<HTMLElement>>('buyerCard');

  private readonly mm = gsap.matchMedia();
  private heroTimeline?: gsap.core.Timeline;
  private lineDrawTween?: gsap.core.Tween;

  private static readonly LINE_DRAW_DURATION = 2.4;
  private static readonly VASE_ROTATE_STEP = '-=90'; // anti-clockwise, one quarter-turn
  private static readonly VASE_ROTATE_DURATION = 1.2;
  private static readonly VASE_ROTATE_HOLD_DURATION = 2.4;

  private static readonly HERO_CARD_SLIDE_PERCENT = 160;
  // These must stay in sync with the -rotate-6 / rotate-35 Tailwind classes on
  // the seller/buyer cards in the template — once GSAP animates rotation on
  // these elements it owns the inline transform outright, so the static
  // class's tilt only survives if this value reproduces it exactly.
  private static readonly SELLER_CARD_REST_ROTATION = -6;
  private static readonly BUYER_CARD_REST_ROTATION = 35;

  private readonly isDesktopViewport = signal(false);
  protected readonly canvasMounted = signal(false);

  private desktopMediaQuery?: MediaQueryList;
  private readonly onDesktopMediaChange = (event: MediaQueryListEvent) => {
    this.isDesktopViewport.set(event.matches);
    if (event.matches) {
      this.canvasMounted.set(true);
    }
  };

  constructor() {
    afterNextRender({
      read: () => {
        this.desktopMediaQuery = window.matchMedia('(min-width: 1024px)');
        this.isDesktopViewport.set(this.desktopMediaQuery.matches);
        if (this.desktopMediaQuery.matches) {
          this.canvasMounted.set(true);
        }
        this.desktopMediaQuery.addEventListener('change', this.onDesktopMediaChange);
      },
    });

    afterNextRender({
      read: () => {
        const model = this.canvasService.spawnVaseInstance();
        if (!model) {
          this.canvasService.sourceReady$
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
              this.canvasService.spawnVaseInstance();
            });
        }
      },
    });

    afterNextRender({
      read: () => this.setupAnimations(),
    });

    effect(() => {
      if (this.preloaderService.dismissed()) {
        this.heroTimeline?.play();
        this.lineDrawTween?.play();
      }
    });

    this.destroyRef.onDestroy(() => {
      this.mm.revert();
      this.desktopMediaQuery?.removeEventListener('change', this.onDesktopMediaChange);
    });
  }

  private setupAnimations(): void {
    this.mm.add('(min-width: 1024px)', () => {
      this.heroTimeline = this.setupHeroEntrance();
      this.lineDrawTween = this.setupLineDraw();
      const paragraphCleanup = this.setupParagraphReveal();
      const vaseRotationCleanup = this.setupVaseRotationLoop();

      return () => {
        this.heroTimeline?.kill();
        this.heroTimeline = undefined;
        this.lineDrawTween?.kill();
        this.lineDrawTween = undefined;
        paragraphCleanup();
        vaseRotationCleanup();
      };
    });
  }

  private setupHeroEntrance(): gsap.core.Timeline | undefined {
    if (this.preloaderService.dismissed()) {
      return undefined;
    }

    const turnYour = this.turnYourWord().nativeElement;
    const products = this.productsWord().nativeElement;
    const intoA = this.intoAWord().nativeElement;
    const trusted = this.trustedWord().nativeElement;
    const business = this.businessWord().nativeElement;
    const sellerCard = this.sellerCard().nativeElement;
    const buyerCard = this.buyerCard().nativeElement;

    gsap.set(turnYour, { xPercent: -100 });
    gsap.set(products, { xPercent: 100 });
    gsap.set(intoA, { xPercent: -110 });
    gsap.set(trusted, { yPercent: 110 });
    gsap.set(business, { xPercent: 100 });
    gsap.set(sellerCard, {
      clipPath: 'inset(0 0 100% 0)',
      rotation: HomeComponent.SELLER_CARD_REST_ROTATION,
      opacity: 0,
    });
    gsap.set(buyerCard, {
      clipPath: 'inset(0 0 100% 0)',
      rotation: HomeComponent.BUYER_CARD_REST_ROTATION,
      opacity: 0,
    });

    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power4.out', duration: 1 } });

    // sellerCard/buyerCard/turnYour all share explicit position 0 (same
    // duration via the timeline defaults above) so the pre-existing
    // '<' / '-=0.6' chain below still resolves to exactly the same absolute
    // times it did before these two cards were added.
    tl.to(
      [sellerCard, buyerCard],
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        duration: 1.4,
        ease: 'power3.inOut',
      },
      0,
    )
      .to(turnYour, { xPercent: 0 }, 0)
      .to(products, { xPercent: 0 }, '<')
      .to(intoA, { xPercent: 0 }, '-=0.6')
      .to(business, { xPercent: 0 }, '<')
      .to(trusted, { yPercent: 0 }, '<');

    return tl;
  }

  /** One-shot reveal, gated behind the preloader so it doesn't burn its only playback while hidden. */
  private setupLineDraw(): gsap.core.Tween {
    const path = this.drawLinePath().nativeElement;
    gsap.set(path, { drawSVG: '0%' });
    return gsap.to(path, {
      drawSVG: '100%',
      duration: HomeComponent.LINE_DRAW_DURATION,
      ease: 'power2.inOut',
      paused: true,
    });
  }

  private setupParagraphReveal(): () => void {
    let split: SplitText | undefined;
    let disposed = false;
    const triggers: ScrollTrigger[] = [];

    document.fonts.ready.then(() => {
      if (disposed) return;

      split = SplitText.create(this.paragraphText().nativeElement, {
        type: 'lines',
        mask: 'lines',
      });

      split.lines.forEach((line, i) => {
        const fromLeft = i % 2 === 0;
        const tween = gsap.from(line, {
          xPercent: fromLeft ? -60 : 60,
          rotation: fromLeft ? -8 : 8,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 80%',
            //markers: true,
            toggleActions: 'play none none reverse',
          },
        });
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
      });
    });

    return () => {
      disposed = true;
      triggers.forEach((trigger) => trigger.kill());
      split?.revert();
    };
  }

  /**
   * Recursive delayedCall/onComplete chain, same shape as the product carousel and the
   * earlier gaze loop — avoids `repeat: -1`'s cached-start-value snap-back, and here it
   * also means each `-=90` step always reads the glyph's live current rotation.
   */
  private setupVaseRotationLoop(): () => void {
    const vaseEl = this.vaseGlyph().nativeElement;
    let tween: gsap.core.Tween | undefined;

    const advance = (): void => {
      tween = gsap.to(vaseEl, {
        rotation: HomeComponent.VASE_ROTATE_STEP,
        duration: HomeComponent.VASE_ROTATE_DURATION,
        ease: 'power2.inOut',
        onComplete: () => {
          tween = gsap.delayedCall(HomeComponent.VASE_ROTATE_HOLD_DURATION, advance);
        },
      });
    };

    tween = gsap.delayedCall(HomeComponent.VASE_ROTATE_HOLD_DURATION, advance);

    return () => {
      tween?.kill();
      tween = undefined;
    };
  }
}
