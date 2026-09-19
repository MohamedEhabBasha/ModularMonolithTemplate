import { afterNextRender, Component, ElementRef, inject, viewChild } from '@angular/core';
import { ThreejsSceneService } from './three-js-service/three-js-scene';


@Component({
  selector: 'app-three-canvas-host',
  imports: [],
  templateUrl: './three-canvas-host.component.html',
  styleUrl: './three-canvas-host.component.css',
})
export class ThreeCanvasHostComponent {
  private readonly canvasService = inject(ThreejsSceneService);
  private readonly webglCanvas = viewChild.required<ElementRef<HTMLCanvasElement>>('webglCanvas');
  private readonly webglCanvasContainer =
    viewChild.required<ElementRef<HTMLElement>>('webglCanvasContainer');

  constructor() {
    afterNextRender(() => {
      this.canvasService.initialize(
        this.webglCanvas().nativeElement,
        this.webglCanvasContainer().nativeElement,
      );
    });
  }
}
