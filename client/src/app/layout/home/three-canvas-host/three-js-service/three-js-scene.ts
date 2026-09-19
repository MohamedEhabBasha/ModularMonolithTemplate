// threejs-scene.service.ts
import { Injectable, OnDestroy } from '@angular/core';

import type { Group } from 'three';
import { BehaviorSubject, ReplaySubject } from 'rxjs';
import { SceneManager } from '../three-js-scene/scene-manager';


// No longer providedIn: 'root' — this is now listed in ThreeCanvasHost's
// own `providers` array, so Angular creates a fresh instance (and calls
// ngOnDestroy, tearing down the renderer) every time ThreeCanvasHost
// mounts/unmounts — i.e. every time Home is entered/left.
@Injectable()
export class ThreejsSceneService implements OnDestroy {
  private sceneManager!: SceneManager;
  private isInitialized$ = new BehaviorSubject<boolean>(false);
  private initializing = false;
  public canvasContainer!: HTMLElement;

  // Fires once the GLB has been parsed and is ready to clone. Home should
  // subscribe and call spawnVaseInstance() again if it mounts before this
  // fires.
  public sourceReady$ = new ReplaySubject<void>(1);

  /**
   * Called ONCE by Home to mount the canvas. Async: SceneManager (and
   * Three.js itself) load in their own chunk the first time this runs,
   * instead of shipping inside Home's chunk up front.
   */
  public async initialize(
    canvasElement: HTMLCanvasElement,
    canvasContainer: HTMLElement,
  ): Promise<void> {
    if (this.isInitialized$.value || this.initializing) return;
    this.initializing = true;

    const { SceneManager } = await import('../three-js-scene/scene-manager');

    this.canvasContainer = canvasContainer;
    this.sceneManager = new SceneManager(canvasElement);
    this.sceneManager.initialize();
    this.isInitialized$.next(true);
    this.initializing = false;

    this.sceneManager.onSourceReady(() => this.sourceReady$.next());
  }

  public setRenderingEnabled(enabled: boolean): void {
    this.sceneManager?.setRenderingEnabled(enabled);
  }

  public setIdleRotationEnabled(enabled: boolean): void {
    this.sceneManager?.setIdleRotationEnabled(enabled);
  }

  /**
   * Mounts the vase instance and returns it. Call this once, as soon as
   * Home is ready to build its GSAP timeline. Returns null if the GLB
   * hasn't finished loading — subscribe to `sourceReady$` and call again.
   */
  public spawnVaseInstance(): Group | null {
    return this.sceneManager?.spawnInstance() ?? null;
  }

  /** Synchronous read of whatever's currently mounted, without spawning a new one. */
  public getActiveInstance(): Group | null {
    return this.sceneManager?.getActiveInstance() ?? null;
  }

  ngOnDestroy(): void {
    this.sceneManager?.setupCleanup();
    this.isInitialized$.next(false);
    this.sourceReady$.complete();
  }
}
