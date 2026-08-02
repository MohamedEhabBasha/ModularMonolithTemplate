import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import gsap from 'gsap';

@Component({
  selector: 'app-marquee',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './marquee.component.html',
  styleUrl: './marquee.component.css',
})
export class MarqueeComponent {
  durationSeconds = input<number>(20);
  pauseOnHover = input<boolean>(true);

  private wrapRef = viewChild.required<ElementRef<HTMLDivElement>>('wrap');

  constructor() {
    const destroyRef = inject(DestroyRef);
    const tweens: gsap.core.Tween[] = [];
    let wrapEl: HTMLDivElement | undefined;

    const onEnter = () => tweens.forEach((t) => t.pause());
    const onLeave = () => tweens.forEach((t) => t.play());

    afterNextRender(() => {
      const wrap = this.wrapRef().nativeElement;
      wrapEl = wrap;

      const original = wrap.querySelector('.ticker-text') as HTMLElement | null;
      if (!original) return;

      const clone = original.cloneNode(true) as HTMLElement;
      wrap.appendChild(clone);

      wrap.querySelectorAll<HTMLElement>('.ticker-text').forEach((el) => {
        tweens.push(
          gsap.to(el, {
            x: '-100%',
            repeat: -1,
            duration: this.durationSeconds(),
            ease: 'none',
          })
        );
      });

      if (this.pauseOnHover()) {
        wrap.addEventListener('mouseenter', onEnter);
        wrap.addEventListener('mouseleave', onLeave);
      }
    });

    destroyRef.onDestroy(() => {
      tweens.forEach((t) => t.kill());
      wrapEl?.removeEventListener('mouseenter', onEnter);
      wrapEl?.removeEventListener('mouseleave', onLeave);
    });
  }
}