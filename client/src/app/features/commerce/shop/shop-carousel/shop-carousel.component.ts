import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';

import type Swiper from 'swiper';
import type { SwiperOptions } from 'swiper/types';

interface Slide {
  readonly id: string;
  readonly eyebrow: string;
  readonly headline: string;
  readonly subline: string;
  readonly imageUrl: string;
  readonly imageAlt: string;
}

@Component({
  selector: 'app-shop-carousel',
  imports: [],
  templateUrl: './shop-carousel.component.html',
  styleUrl: './shop-carousel.component.css',
})
export class ShopCarouselComponent {
  readonly slides = input<readonly Slide[]>([
    {
      id: 'best-sellers',
      eyebrow: 'BEST SELLERS',
      headline: 'Customer Favorites',
      subline: 'The products everyone is talking about.',
      imageUrl:
        'commerce/shop-1.avif',
      imageAlt: 'A curated stack of best-selling products',
    },
    {
      id: 'exclusive-offers',
      eyebrow: 'EXCLUSIVE OFFERS',
      headline: 'Up to 40% Off',
      subline: 'Premium products. Limited-time prices.',
      imageUrl:
        'commerce/shop-2.avif',
      imageAlt: 'Premium product on display at a discounted price',
    },
    {
      id: 'shop-with-confidence',
      eyebrow: 'SHOP WITH CONFIDENCE',
      headline: 'Fast. Secure. Reliable.',
      subline: 'Fast shipping, secure payments, and easy returns.',
      imageUrl:
        'commerce/shop-3.avif',
      imageAlt: 'Package ready for fast, secure delivery',
    },
  ]);

  readonly autoplayDelayMs = input<number>(5000);

  private readonly swiperEl = viewChild.required<ElementRef<HTMLDivElement>>('swiperContainer');
  private readonly destroyRef = inject(DestroyRef);

  private swiperInstance: Swiper | null = null;

  readonly activeIndex = signal(0);
  readonly reducedMotion = signal(false);

  constructor() {
    afterNextRender(() => {
      this.reducedMotion.set(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
      void this.initSwiper();
    });

    this.destroyRef.onDestroy(() => {
      this.swiperInstance?.destroy(true, true);
      this.swiperInstance = null;
    });
  }

  private async initSwiper(): Promise<void> {
    const [{ default: Swiper }, { Autoplay, EffectFade, A11y }] = await Promise.all([
      import('swiper'),
      import('swiper/modules'),
    ]);
 
    const options: SwiperOptions = {
      modules: [Autoplay, EffectFade, A11y],
      effect: 'fade',
      fadeEffect: { crossFade: true },
      loop: false,
      slidesPerView: 1,
      slidesPerGroup: 1,
      speed: 700,
      autoplay: this.reducedMotion()
        ? false
        : {
            delay: this.autoplayDelayMs(),
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          },
      a11y: {
        enabled: true,
        prevSlideMessage: 'Previous slide',
        nextSlideMessage: 'Next slide',
        slideLabelMessage: 'Slide {{index}} of {{slidesLength}}',
      },
      on: {
        slideChange: (swiper) => {
          this.activeIndex.set(swiper.activeIndex);
        },
      },
    };
 
    this.swiperInstance = new Swiper(this.swiperEl().nativeElement, options);
  }
 
  goTo(index: number): void {
    this.swiperInstance?.slideTo(index);
  }
}
