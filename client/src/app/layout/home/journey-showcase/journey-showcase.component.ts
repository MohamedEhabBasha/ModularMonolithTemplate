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

interface JourneyMedia {
  type: 'image' | 'video';
  src: string;
  alt?: string;
}

interface JourneyStep {
  step: string;
  heading: string;
  description: string;
  left: JourneyMedia;
  right: JourneyMedia;
}
@Component({
  selector: 'app-journey-showcase',
  standalone: true,
  templateUrl: './journey-showcase.component.html',
  styleUrl: './journey-showcase.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JourneyShowcaseComponent {
  protected readonly eyebrow = '000 / Mwgoods';
  protected readonly title = 'Your Journey';

  protected readonly steps: JourneyStep[] = [
    {
      step: '001',
      heading: 'Discover',
      description:
        'Browse categories, view seller profiles, and see how products are discussed within the community.',
      left: {
        type: 'image',
        src: 'home/journey-left-1.avif',
        alt: 'Editorial fashion portrait in a warm studio',
      },
      right: {
        type: 'image',
        src: 'home/journey-right-1.avif',
        alt: 'Editorial fashion portrait against a pale background',
      },
    },
    {
      step: '002',
      heading: 'Connect',
      description:
        'Ask questions, join discussions, share experiences, and give feedback before and after purchasing. Every product lives within a conversation — not just a rating.',
      left: {
        type: 'image',
        src: 'home/journey-left-2.avif',
      },
      right: {
        type: 'image',
        src: 'home/journey-right-2.avif',
      },
    },
    {
      step: '003',
      heading: 'Grow',
      description:
        'Buy with clarity or sell with credibility. Build reputation, improve products through feedback, and grow within a trusted ecosystem.',
      left: {
        type: 'image',
        src: 'home/journey-left-3.avif',
      },
      right: {
        type: 'image',
        src: 'home/journey-right-3.avif',
      },
    },
  ];

  private readonly sectionRef = viewChild.required<ElementRef<HTMLElement>>('section');
  private readonly destroyRef = inject(DestroyRef);
  private context?: gsap.Context;

  private static hasRegisteredScrollTrigger = false;

  constructor() {
    afterNextRender(() => this.createScrollSequence());
    this.destroyRef.onDestroy(() => this.context?.revert());
  }

  refreshScrollTrigger(): void {
    if (!this.context) return;
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }

  private createScrollSequence(): void {
    if (!JourneyShowcaseComponent.hasRegisteredScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);
      JourneyShowcaseComponent.hasRegisteredScrollTrigger = true;
    }

    const section = this.sectionRef().nativeElement;

    this.context = gsap.context(() => {
      const query = gsap.utils.selector(section);
      const leftImage = query('.journey-showcase__visual--left')[0] as HTMLElement;
      const rightImage = query('.journey-showcase__visual--right')[0] as HTMLElement;
      const title = query('.journey-showcase__title')[0] as HTMLElement;
      const hint = query('.journey-showcase__hint')[0] as HTMLElement;
      const stepTexts = query('.journey-showcase__step-text') as HTMLElement[];
      const copyPanels = query('.journey-showcase__copy-panel') as HTMLElement[];
      const leftFrames = Array.from(
        leftImage.querySelectorAll<HTMLElement>('.journey-showcase__frame'),
      );
      const rightFrames = Array.from(
        rightImage.querySelectorAll<HTMLElement>('.journey-showcase__frame'),
      );

      const media = gsap.matchMedia();
      media.add('(min-width: 1024px)', () =>
        this.buildTimeline({
          isDesktop: true,
          section,
          leftImage,
          rightImage,
          title,
          hint,
          stepTexts,
          copyPanels,
          leftFrames,
          rightFrames,
        }),
      );
      media.add('(max-width: 1023px)', () =>
        this.buildTimeline({
          isDesktop: false,
          section,
          leftImage,
          rightImage,
          title,
          hint,
          stepTexts,
          copyPanels,
          leftFrames,
          rightFrames,
        }),
      );

      return () => media.revert();
    }, section);
  }

  private buildTimeline(elements: {
    isDesktop: boolean;
    section: HTMLElement;
    leftImage: HTMLElement;
    rightImage: HTMLElement;
    title: HTMLElement;
    hint: HTMLElement;
    stepTexts: HTMLElement[];
    copyPanels: HTMLElement[];
    leftFrames: HTMLElement[];
    rightFrames: HTMLElement[];
  }): () => void {
    const {
      isDesktop,
      section,
      leftImage,
      rightImage,
      title,
      hint,
      stepTexts,
      copyPanels,
      leftFrames,
      rightFrames,
    } = elements;

    const stepCount = this.steps.length;
    const entranceDistance = () => window.innerHeight * 1.15;
    const leftFinalY = () => window.innerHeight - leftImage.offsetTop - leftImage.offsetHeight;
    const rightFinalY = () => -rightImage.offsetTop;

    // --- initial states ---
    gsap.set([stepTexts, copyPanels], { autoAlpha: 0, y: 24 });
    gsap.set(title, { autoAlpha: 0 });
    gsap.set(hint, { autoAlpha: 1 });
    gsap.set(leftImage, { y: () => -entranceDistance() });
    if (isDesktop) gsap.set(rightImage, { y: () => entranceDistance() });

    this.setFrameState(leftFrames, 0);
    this.setFrameState(rightFrames, 0);

    const timeline = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: () => `+=${window.innerHeight * (2.2 + (stepCount - 1) * 1.3)}`,
        pin: true,
        scrub: 0.9,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    // --- phase 1: arrival ---
    timeline
      .addLabel('arrival')
      .to(leftImage, { y: 0, duration: 1 }, 'arrival')
      .to(title, { autoAlpha: 1, duration: 0.65 }, 'arrival+=0.25');

    if (isDesktop) timeline.to(rightImage, { y: 0, duration: 1 }, 'arrival');

    // --- phase 2: settle + reveal step 1 ---
    timeline
      .addLabel('discover', '+=0.15')
      .to(title, { autoAlpha: 0.3, duration: 0.75 }, 'discover')
      .to(
        leftImage,
        { y: isDesktop ? leftFinalY : () => window.innerHeight * 0.13, duration: 1.1 },
        'discover',
      )
      .to(hint, { autoAlpha: 0, duration: 0.28 }, 'discover');

    if (isDesktop) timeline.to(rightImage, { y: rightFinalY, duration: 1.1 }, 'discover');

    timeline
      .to(stepTexts[0], { autoAlpha: 1, y: 0, duration: 0.42 }, 'discover+=0.56')
      .to(copyPanels[0], { autoAlpha: 1, y: 0, duration: 0.48 }, 'discover+=0.7');

    // --- phase 3+: wipe-reveal each subsequent step ---
    for (let i = 1; i < stepCount; i++) {
      const label = `step-${i}`;
      timeline.addLabel(label, '+=0.4');

      this.addWipeReveal(timeline, leftFrames[i], label);
      if (isDesktop) this.addWipeReveal(timeline, rightFrames[i], label);

      timeline
        .to(stepTexts[i - 1], { autoAlpha: 0, y: -16, duration: 0.35 }, label)
        .fromTo(
          stepTexts[i],
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          `${label}+=0.15`,
        )
        .to(copyPanels[i - 1], { autoAlpha: 0, y: -16, duration: 0.35 }, label)
        .fromTo(
          copyPanels[i],
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.4 },
          `${label}+=0.2`,
        );
    }

    timeline.to({}, { duration: 0.5 });

    return () => timeline.kill();
  }

  /** Sets which frame in a left/right stack starts visible and unmasked. */
  private setFrameState(frames: HTMLElement[], activeIndex: number): void {
    frames.forEach((frame, idx) => {
      const outer = frame.querySelector<HTMLElement>('.journey-showcase__mask-outer')!;
      const inner = frame.querySelector<HTMLElement>('.journey-showcase__mask-inner')!;
      gsap.set(frame, { autoAlpha: idx === activeIndex ? 1 : 0 });
      gsap.set(outer, { xPercent: idx === activeIndex ? 0 : 100 });
      gsap.set(inner, { xPercent: idx === activeIndex ? 0 : -100 });
    });
  }

  /** The reveal: outer mask slides in from the right while the inner content
   *  counter-slides from the left, so the image appears to unmask in place
   *  rather than visibly travel across the frame. */
  private addWipeReveal(timeline: gsap.core.Timeline, frame: HTMLElement, position: string): void {
    const outer = frame.querySelector<HTMLElement>('.journey-showcase__mask-outer')!;
    const inner = frame.querySelector<HTMLElement>('.journey-showcase__mask-inner')!;

    timeline
      .to(frame, { autoAlpha: 1, duration: 0.1 }, position)
      .to(outer, { xPercent: 0, duration: 1 }, position)
      .to(inner, { xPercent: 0, duration: 1 }, position);
  }
}
