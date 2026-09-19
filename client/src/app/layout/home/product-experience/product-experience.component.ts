import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

interface ProductImage {
  src: string;
  alt: string;
}

interface ProductInteractionGrid {
  center: ProductImage;
  reviews: ProductImage;
  ratings: ProductImage;
  testimonial: ProductImage;
  comments: ProductImage;
}

@Component({
  selector: 'app-product-experience',
  templateUrl: './product-experience.component.html',
  styleUrl: './product-experience.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductExperienceComponent {
  protected readonly products: ProductImage[] = [
    { src: 'home/product-1.avif', alt: 'Product one' },
    { src: 'home/product-2.avif', alt: 'Product two' },
    { src: 'home/product-3.avif', alt: 'Product three' },
  ];

  protected readonly productInteractions: ProductInteractionGrid = {
    center: { src: 'home/product-interaction-1.avif', alt: 'Seller profile card for Stride Co.' },
    reviews: { src: 'home/product-interaction-2.avif', alt: 'Customer feedback and star ratings' },
    ratings: { src: 'home/product-interaction-3.avif', alt: 'Overall rating breakdown' },
    testimonial: { src: 'home/product-interaction-4.avif', alt: 'Customer testimonial quote' },
    comments: { src: 'home/product-interaction-5.avif', alt: 'Community comment thread' },
  };

  private static readonly RADIUS_MULTIPLIER = 5; // pivot distance below each image, as a multiple
  private static readonly STEP_DURATION = 1; // seconds the rotation itself takes
  private static readonly STEP_INTERVAL = 5; // seconds between the start of one rotation and the next

  private static readonly INTRO_DURATION = 0.9; // seconds each of heading/paragraph takes to reveal
  private static readonly INTRO_OVERLAP = 0.5; // seconds the paragraph tween overlaps the heading's tail

  private static readonly SPREAD_DURATION = 1.1; // seconds for a card to travel out from center
  private static readonly SPREAD_STAGGER = 0.1; // seconds between each card leaving center
  private static readonly FLOAT_AMPLITUDE = 10; // px of vertical drift in the idle float

  private static hasRegisteredScrollTrigger = false;

  private readonly sectionRef = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly holderRef = viewChild.required<ElementRef<HTMLElement>>('holder');
  private readonly introHeadingRef = viewChild.required<ElementRef<HTMLElement>>('introHeading');
  private readonly introParagraphRef =
    viewChild.required<ElementRef<HTMLElement>>('introParagraph');
  private readonly rightGridRef = viewChild.required<ElementRef<HTMLElement>>('rightGrid');

  private readonly destroyRef = inject(DestroyRef);
  private readonly triggers: ScrollTrigger[] = [];

  constructor() {
    afterNextRender({
      read: () => {
        this.ensureScrollTriggerRegistered();
        this.buildProductWheel();
        this.buildIntroReveal();
        this.buildInteractionGridReveal();
      },
    });
    this.destroyRef.onDestroy(() => this.triggers.forEach((trigger) => trigger.kill()));
  }

  private ensureScrollTriggerRegistered(): void {
    if (!ProductExperienceComponent.hasRegisteredScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      ProductExperienceComponent.hasRegisteredScrollTrigger = true;
    }
  }

  private buildProductWheel(): void {
    const section = this.sectionRef().nativeElement;
    const holder = this.holderRef().nativeElement;
    const images = Array.from(
      section.querySelectorAll<HTMLElement>('.product-experience__product'),
    );
    const total = images.length;
    if (!total) return;

    const slotAngle = 360 / total;
    const finalRotation = (index: number): number => slotAngle * index;

    const holderRect = holder.getBoundingClientRect();
    const radius = holderRect.height * ProductExperienceComponent.RADIUS_MULTIPLIER;

    images.forEach((img, index) => {
      gsap.set(img, {
        xPercent: -50,
        yPercent: -50,
        opacity: 1,
        transformOrigin: `50% ${radius}px`,
        rotation: finalRotation(index),
      });
    });

    // The only thing on a timer: rotate the whole wheel forward by one slot
    // every STEP_INTERVAL seconds, forever.
    const stepDuration = ProductExperienceComponent.STEP_DURATION;
    const stepInterval = ProductExperienceComponent.STEP_INTERVAL;
    const pauseDuration = stepInterval - stepDuration;

    let currentTween: gsap.core.Timeline | undefined;

    const rotateNext = (): void => {
      currentTween = gsap
        .timeline({
          onComplete: rotateNext,
        })
        .to(
          {},
          {
            duration: pauseDuration,
          },
        )
        .to(images, {
          rotation: `-=${slotAngle}`,
          duration: stepDuration,
          ease: 'power1.inOut',
        });
    };

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top bottom',
      once: true,
      onEnter: () => rotateNext(),
      onLeave: () => currentTween?.pause(),
    });

    this.triggers.push(trigger);
  }

  private buildIntroReveal(): void {
    const heading = this.introHeadingRef().nativeElement;
    const paragraph = this.introParagraphRef().nativeElement;

    gsap.set([heading, paragraph], { opacity: 0, y: 28 });

    const trigger = ScrollTrigger.create({
      trigger: this.sectionRef().nativeElement,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        gsap
          .timeline()
          .to(heading, {
            opacity: 1,
            y: 0,
            duration: ProductExperienceComponent.INTRO_DURATION,
            ease: 'power3.out',
          })
          .to(
            paragraph,
            {
              opacity: 1,
              y: 0,
              duration: ProductExperienceComponent.INTRO_DURATION,
              ease: 'power3.out',
            },
            `-=${ProductExperienceComponent.INTRO_OVERLAP}`,
          );
      },
    });

    this.triggers.push(trigger);
  }

  private buildInteractionGridReveal(): void {
    const grid = this.rightGridRef().nativeElement;
    const images = Array.from(
      grid.querySelectorAll<HTMLElement>('.product-experience__interaction'),
    );
    if (!images.length) return;

    // Park every card at the grid's center (scaled down + invisible) by
    // offsetting each one from its own natural, CSS-defined position.
    const gridRect = grid.getBoundingClientRect();
    const gridCenterX = gridRect.width / 2;
    const gridCenterY = gridRect.height / 2;

    const centerOffsets = images.map((img) => {
      const imgRect = img.getBoundingClientRect();
      const imgCenterX = imgRect.left - gridRect.left + imgRect.width / 2;
      const imgCenterY = imgRect.top - gridRect.top + imgRect.height / 2;
      return {
        x: gridCenterX - imgCenterX,
        y: gridCenterY - imgCenterY,
      };
    });

    images.forEach((img, index) => {
      gsap.set(img, {
        x: centerOffsets[index].x,
        y: centerOffsets[index].y,
        scale: 0.25,
        opacity: 0,
      });
    });

    const trigger = ScrollTrigger.create({
      trigger: this.sectionRef().nativeElement,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        gsap.timeline({ onComplete: () => this.startInteractionFloat(images) }).to(images, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          duration: ProductExperienceComponent.SPREAD_DURATION,
          ease: 'back.out(1.4)',
          stagger: ProductExperienceComponent.SPREAD_STAGGER,
        });
      },
    });

    this.triggers.push(trigger);
  }

  // Gentle, endless bob once each card has landed, so the grid never feels
  // fully static. Amplitude/duration/delay vary per card so they don't all
  // move in lockstep.
  private startInteractionFloat(images: HTMLElement[]): void {
    images.forEach((img, index) => {
      const amplitude = ProductExperienceComponent.FLOAT_AMPLITUDE + (index % 3) * 3;
      const direction = index % 2 === 0 ? 1 : -1;

      gsap.to(img, {
        y: `+=${amplitude * direction}`,
        duration: 2.4 + (index % 4) * 0.4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: index * 0.2,
      });
    });
  }
}
