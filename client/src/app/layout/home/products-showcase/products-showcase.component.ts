import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  input,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

ScrollTrigger.config({ ignoreMobileResize: true });

export interface ShowcaseProduct {
  id: string | number;
  imageUrl: string;
  revealImageUrl: string;
  alt?: string;
}

const DEFAULT_PRODUCTS: ShowcaseProduct[] = [
  {
    id: 1,
    imageUrl: 'home/model-product-1.avif',
    revealImageUrl: 'home/model-1.avif',
    alt: 'Red sneaker',
  },
  {
    id: 2,
    imageUrl: 'home/model-product-2.avif',
    revealImageUrl: 'home/model-2.avif',
    alt: 'Watch',
  },
  {
    id: 3,
    imageUrl: 'home/model-product-3.avif',
    revealImageUrl: 'home/model-3.avif',
    alt: 'Sunglasses',
  },
];



const IMAGE_GAP_RATIO = 0.4;
const RESIZE_DEBOUNCE_MS = 150;
const HOLDER_RADIUS_PX = 24;

@Component({
  selector: 'app-products-showcase',
  standalone: true,
  templateUrl: './products-showcase.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductsShowcaseComponent implements OnDestroy {
  readonly products = input<ShowcaseProduct[]>(DEFAULT_PRODUCTS);

  private readonly galleryWrapper = viewChild.required<ElementRef<HTMLElement>>('galleryWrapper');
  private readonly heroStrip = viewChild.required<ElementRef<HTMLElement>>('heroStrip');
  private readonly teaserStrip = viewChild.required<ElementRef<HTMLElement>>('teaserStrip');
  private readonly holder = viewChild.required<ElementRef<HTMLElement>>('holder');
  private readonly header = viewChild.required<ElementRef<HTMLElement>>('header');
  private readonly ctaSlot = viewChild.required<ElementRef<HTMLElement>>('ctaSlot');

  private timeline?: gsap.core.Timeline;
  private scrollTrigger?: ScrollTrigger;
  private headerSplit?: SplitText;
  private resizeObserver?: ResizeObserver;
  private resizeTimeout?: ReturnType<typeof setTimeout>;

  private lastWrapperWidth = 0;
  private lastHolderWidth = 0;

  constructor() {
    afterNextRender(() => {
      this.setupScroll();
      this.setupHeaderReveal();

      this.lastWrapperWidth = this.galleryWrapper().nativeElement.clientWidth;
      this.lastHolderWidth = this.holder().nativeElement.clientWidth;

      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.galleryWrapper().nativeElement);
      this.resizeObserver.observe(this.holder().nativeElement);
    });
  }

  ngOnDestroy(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeObserver?.disconnect();
    this.scrollTrigger?.kill();
    this.timeline?.kill();
    this.headerSplit?.revert();
  }

  private setupHeaderReveal(): void {
    this.headerSplit = SplitText.create(this.header().nativeElement, {
      type: 'words',
      mask: 'words',
      autoSplit: true,
      onSplit: (self) =>
        gsap.from(self.words, {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: 'power4.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: this.header().nativeElement,
            start: 'top 85%',
            once: true,
          },
        }),
    });
  }

  private handleResize(): void {
    const wrapperWidth = this.galleryWrapper().nativeElement.clientWidth;
    const holderWidth = this.holder().nativeElement.clientWidth;

    if (wrapperWidth === this.lastWrapperWidth && holderWidth === this.lastHolderWidth) {
      return;
    }

    this.lastWrapperWidth = wrapperWidth;
    this.lastHolderWidth = holderWidth;
    this.scheduleRebuild();
  }

  private scheduleRebuild(): void {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => this.setupScroll(), RESIZE_DEBOUNCE_MS);
  }

  private setupScroll(): void {
    this.scrollTrigger?.kill();
    this.timeline?.kill();

    const heroImages = Array.from(this.heroStrip().nativeElement.querySelectorAll('img'));
    const teaserImages = Array.from(this.teaserStrip().nativeElement.querySelectorAll('img'));
    const ctaEl = this.ctaSlot().nativeElement;
    if (!heroImages.length || heroImages.length !== teaserImages.length) return;

    gsap.set([...heroImages, ...teaserImages, ctaEl], { clearProps: 'transform' });

    this.updateClipWindows();

    const imageWidth = heroImages[0].clientWidth;
    const imageGap = imageWidth * IMAGE_GAP_RATIO;
    const stopX = this.computeStopX(heroImages[0]);
    const step = imageWidth + imageGap;

    const timeline = gsap.timeline({
      scrollTrigger: {
        trigger: this.galleryWrapper().nativeElement,
        pin: this.galleryWrapper().nativeElement,
        start: 'center center',
        end: () => `+=400%`,
        scrub: true,
        invalidateOnRefresh: true,
      },
    });

    const pairs = heroImages.map((heroImg, i) => [heroImg, teaserImages[i]]);

    // Phase 0: the whole convoy — images and the CTA — settles together.
    pairs.forEach((pair, index) => {
      const initialX = step * index;
      timeline.fromTo(pair, { x: initialX }, { x: initialX + stopX, duration: 1, ease: 'none' }, 0);
    });

    // Each image then arrives in the holder in turn, exactly as before.
    for (let phase = 1; phase < pairs.length; phase++) {
      pairs.slice(phase).forEach((pair, index) => {
        timeline.to(pair, { x: `-=${step}`, duration: 1, ease: 'none' }, index === 0 ? '>' : '<');
      });
    }

    const ctaSubHeader = new SplitText(ctaEl, { type: 'words' });
    timeline.add(gsap.fromTo(ctaSubHeader.words, {y: 20, opacity: 0}, { y: 0, opacity: 1, duration: .8, stagger: 0.1, ease: 'power2.out' }), '>');
    timeline.to({}, { duration: 0.5 }); // Add a small delay at the end of the timeline

    this.timeline = timeline;
    this.scrollTrigger = timeline.scrollTrigger ?? undefined;
    this.scrollTrigger?.refresh();
  }

  private updateClipWindows(): void {
    const wrapperRect = this.galleryWrapper().nativeElement.getBoundingClientRect();
    const holderRect = this.holder().nativeElement.getBoundingClientRect();

    const top = holderRect.top - wrapperRect.top;
    const left = holderRect.left - wrapperRect.left;
    const right = wrapperRect.right - holderRect.right;
    const bottom = wrapperRect.bottom - holderRect.bottom;

    this.heroStrip().nativeElement.style.clipPath =
      `inset(${top}px ${right}px ${bottom}px ${left}px round ${HOLDER_RADIUS_PX}px ${HOLDER_RADIUS_PX}px 0 0)`;

    const teaserLeft = holderRect.right - wrapperRect.left;
    this.teaserStrip().nativeElement.style.clipPath = `inset(${top}px 0px ${bottom}px ${teaserLeft}px)`;
  }

  private computeStopX(sampleImage: HTMLElement): number {
    const holderRect = this.holder().nativeElement.getBoundingClientRect();
    const imageRect = sampleImage.getBoundingClientRect();
    const holderCenterX = holderRect.left + holderRect.width / 2;
    const imageCenterX = imageRect.left + imageRect.width / 2;
    return holderCenterX - imageCenterX;
  }
}