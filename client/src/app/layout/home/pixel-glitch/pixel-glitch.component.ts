import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { gsap } from 'gsap';

/** A cell coordinate within the glyph's GRID_SIZE x GRID_SIZE grid. */
interface Cell {
  readonly row: number;
  readonly col: number;
}

/**
 * Ambient canvas flourish — a small pixel-art corner bracket that sweeps
 * through all four corners of its own bounding box (top-left → top-right →
 * bottom-right → bottom-left → repeat), desynced per instance so scattered
 * copies never flip in unison. Positioning, count, and per-spot styling are
 * the caller's concern (see CtaComponent.pixelGlitchSpots); this component
 * only owns the draw loop for one instance.
 */
@Component({
  selector: 'app-pixel-glitch',
  standalone: true,
  templateUrl: './pixel-glitch.component.html',
  styleUrl: './pixel-glitch.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PixelGlitchComponent {
  readonly sizePx = input(28);
  readonly color = input('#00e1ff');

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  private static readonly GRID_SIZE = 6;
  private static readonly ARM_LENGTH = 3; // cells per arm, corner cell included

  // Top-left corner bracket; the other 3 orientations are derived by rotation
  // (see rotateCell) rather than hand-authored, so all four stay perfectly
  // symmetric by construction.
  private static readonly BASE_GLYPH: readonly Cell[] = [
    { row: 0, col: 0 },
    ...Array.from({ length: PixelGlitchComponent.ARM_LENGTH - 1 }, (_, i) => ({
      row: i + 1,
      col: 0,
    })),
    ...Array.from({ length: PixelGlitchComponent.ARM_LENGTH - 1 }, (_, i) => ({
      row: 0,
      col: i + 1,
    })),
  ];

  private static readonly GLYPH_FRAMES: readonly (readonly Cell[])[] =
    PixelGlitchComponent.buildFrames();

  private static readonly HOLD_DURATION_MIN = 1.4;
  private static readonly HOLD_DURATION_MAX = 2.2;

  private ctx?: CanvasRenderingContext2D;
  private cellPx = 0;
  private frameIndex = 0;
  private advanceTween?: gsap.core.Tween;

  constructor() {
    afterNextRender({
      read: () => this.init(),
    });

    this.destroyRef.onDestroy(() => {
      this.advanceTween?.kill();
    });
  }

  private static buildFrames(): readonly (readonly Cell[])[] {
    const frames: Cell[][] = [PixelGlitchComponent.BASE_GLYPH.slice()];
    for (let i = 1; i < 4; i++) {
      frames.push(frames[i - 1].map((cell) => PixelGlitchComponent.rotateCell(cell)));
    }
    return frames;
  }

  // 90° clockwise rotation of a cell within a GRID_SIZE x GRID_SIZE grid.
  private static rotateCell(cell: Cell): Cell {
    const last = PixelGlitchComponent.GRID_SIZE - 1;
    return { row: cell.col, col: last - cell.row };
  }

  private init(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = this.sizePx();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.scale(dpr, dpr);

    this.ctx = ctx;
    this.cellPx = size / PixelGlitchComponent.GRID_SIZE;
    // Desync so scattered copies never sweep corners in unison.
    this.frameIndex = Math.floor(Math.random() * PixelGlitchComponent.GLYPH_FRAMES.length);
    this.draw();

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return; // static single frame only
    }
    this.scheduleAdvance();
  }

  // Recursive delayedCall, not `gsap.timeline({ repeat: -1 })` — same
  // reasoning as the carousel/gaze/vase loops elsewhere in this app: a
  // repeating timeline caches its start state, this always advances from
  // whatever frame is actually on screen.
  private scheduleAdvance(): void {
    const holdDuration = gsap.utils.random(
      PixelGlitchComponent.HOLD_DURATION_MIN,
      PixelGlitchComponent.HOLD_DURATION_MAX,
    );
    this.advanceTween = gsap.delayedCall(holdDuration, () => {
      this.frameIndex = (this.frameIndex + 1) % PixelGlitchComponent.GLYPH_FRAMES.length;
      this.draw();
      this.scheduleAdvance();
    });
  }

  private draw(): void {
    if (!this.ctx) return;
    const size = this.sizePx();
    this.ctx.clearRect(0, 0, size, size);
    this.ctx.fillStyle = this.color();

    const frame = PixelGlitchComponent.GLYPH_FRAMES[this.frameIndex];
    for (const cell of frame) {
      this.ctx.fillRect(cell.col * this.cellPx, cell.row * this.cellPx, this.cellPx, this.cellPx);
    }
  }
}