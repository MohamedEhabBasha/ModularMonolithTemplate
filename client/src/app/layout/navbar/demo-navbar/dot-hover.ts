import { Directive, DestroyRef, ElementRef, afterNextRender, inject } from '@angular/core';
import gsap from 'gsap';

@Directive({
  selector: '[appDotHover]',
  host: { class: 'dot-hover-link' },
})
export class DotHoverDirective {
  private readonly elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  private timeline?: gsap.core.Timeline;
  private host!: HTMLElement;

  private readonly isActive = () => this.host.classList.contains('active');

  private readonly onEnter = () => this.timeline?.play();
  private readonly onLeave = () => {
    if (!this.isActive()) this.timeline?.reverse();
  };
  private readonly syncActiveState = () => {
    if (this.isActive()) {
      this.timeline?.play();
    } else if (!this.host.matches(':hover, :focus-visible')) {
      this.timeline?.reverse();
    }
  };

  constructor() {
    afterNextRender(() => {
      this.host = this.elementRef.nativeElement;
      const dot = this.host.querySelector<HTMLElement>('.dot-hover__dot');
      const line = this.host.querySelector<HTMLElement>('.dot-hover__line');
      if (!dot || !line) return;

      this.timeline = gsap
        .timeline({ paused: true, defaults: { duration: 0.35, ease: 'power2.out' } })
        .to(dot, { left: '100%', xPercent: -100 }, 0)
        .to(line, { scaleX: 1 }, 0)
        .progress(this.isActive() ? 1 : 0); // snap to the correct state on load, no animation

      const observer = new MutationObserver(this.syncActiveState);
      observer.observe(this.host, { attributes: true, attributeFilter: ['class'] });

      this.host.addEventListener('mouseenter', this.onEnter);
      this.host.addEventListener('mouseleave', this.onLeave);
      this.host.addEventListener('focus', this.onEnter);
      this.host.addEventListener('blur', this.onLeave);

      this.destroyRef.onDestroy(() => {
        observer.disconnect();
        this.host.removeEventListener('mouseenter', this.onEnter);
        this.host.removeEventListener('mouseleave', this.onLeave);
        this.host.removeEventListener('focus', this.onEnter);
        this.host.removeEventListener('blur', this.onLeave);
        this.timeline?.kill();
      });
    });
  }
}