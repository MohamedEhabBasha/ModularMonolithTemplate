// scene-manager.ts
import {
  WebGLRenderer,
  PerspectiveCamera,
  Scene,
  Group,
  Mesh,
  Timer,
  AmbientLight,
  SpotLight,
  PlaneGeometry,
  ShadowMaterial,
  ACESFilmicToneMapping,
  Vector3,
  Box3,
  PCFShadowMap,
  DirectionalLight,
} from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export class SceneManager {
  private renderer!: WebGLRenderer;
  private camera!: PerspectiveCamera;
  private scene!: Scene;
  private clock = new Timer();

  // Y (local space) of the pedestal's top surface as it's painted into the
  // backdrop photo — the vase's resting position is derived from this, so
  // it visually sits on the photographed pedestal rather than floating.
  // Tune against your actual photo.
  private readonly PEDESTAL_HEIGHT = 1.2;
  private readonly VASE_BASE_Y = 0;
  // Y of the spotlight fixture. There's no literal ceiling anymore (the
  // room is a flat photo), so this is just "how high above the vase the
  // key light sits" — tune the height/angle to match the light direction
  // visible in your photo.
  private readonly KEY_LIGHT_HEIGHT = 14;

  // Footprint of the invisible shadow-catching plane. Bigger than the
  // pedestal itself so the shadow's soft edge doesn't clip abruptly.
  private readonly SHADOW_CATCHER_SIZE = 6;

  // The pristine, parsed GLTF scene graph. Never added to `scene`, never
  // mutated after load — it exists only to be `.clone()`d. Cloning
  // duplicates the lightweight Object3D/Mesh wrapper nodes but NOT the
  // BufferGeometry/Material/Texture data, so spawning an instance is cheap
  // even though the source GLB is 1.6MB.
  private sourceModel: Group | null = null;

  // The instance currently mounted in the scene. SceneManager lives for
  // exactly as long as Home does (component-scoped provider), so
  // spawnInstance() is really only ever called once per mount — this guard
  // just protects against a stray second call (e.g. HMR) leaking the
  // previous instance.
  public activeInstance: Group | null = null;

  private onSourceReadyCallback?: (source: Group) => void;
  private onProgressCallback?: (percent: number) => void;
  private animationFrameId!: number;

  // Recentered local origin of the source model, captured once right after
  // the bounding-box recenter in loadModel(). Every clone inherits this same
  // local x/z, so instance transforms are always applied relative to this
  // fixed base instead of drifting cumulatively.
  private basePosition = new Vector3();

  // Half the model's raw (pre-scale) height, captured alongside
  // basePosition. Used to compute the Y that plants the model's bottom
  // exactly on the pedestal's top face at any breakpoint scale.
  private modelHalfHeight = 0;

  // Gates expensive per-frame work only. clock.update() always runs so
  // `delta` never spikes when rendering resumes.
  private renderingEnabled = true;

  // Lets a page take exclusive ownership of rotation (e.g. a GSAP/
  // ScrollTrigger-driven spin) without the idle auto-rotation fighting it
  // frame by frame.
  private idleRotationEnabled = true;

  constructor(private canvas: HTMLCanvasElement) {}

  initialize() {
    const width = this.canvas.clientWidth || window.innerWidth;
    const height = this.canvas.clientHeight || window.innerHeight;

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, width / height, 0.1, 100);

    // alpha:true — the room is now a CSS background behind the canvas, so
    // the canvas itself must stay transparent everywhere except the vase
    // and its cast shadow.
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = PCFShadowMap;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.buildShadowCatcher();
    this.addLighting();

    this.loadModel();
    this.animate();

    window.addEventListener('resize', this.onWindowResize);
  }

  /**
   * An invisible plane that only ever shows up where a shadow falls on it
   * (ShadowMaterial renders fully transparent everywhere else). This is
   * what grounds the vase against the photo — without it the vase has no
   * contact shadow and reads as pasted on rather than sitting on the
   * photographed pedestal.
   */
  private buildShadowCatcher(): void {
    const shadowCatcher = new Mesh(
      new PlaneGeometry(this.SHADOW_CATCHER_SIZE, this.SHADOW_CATCHER_SIZE),
      new ShadowMaterial({ opacity: 0.45 }),
    );
    shadowCatcher.rotation.x = -Math.PI / 2;
    shadowCatcher.position.set(0, this.VASE_BASE_Y, 0);
    shadowCatcher.receiveShadow = true;
    this.scene.add(shadowCatcher);
  }

  /**
   * One key light matching the backdrop photo's overhead downlight, plus a
   * low warm-red ambient standing in for the bounce light the old 3D
   * room's red walls used to provide. No beam mesh here — the photo
   * already has a rendered beam; overlaying a second, not-quite-aligned
   * one would look like a double exposure.
   */
  private addLighting(): void {
    const ambientLight = new AmbientLight(0xffffff, 0.1);
    this.scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 6.5);
    directionalLight.position.set(0, 30, 0);
    directionalLight.castShadow = true;
    //directionalLight.shadow.mapSize.width = 2048;
    this.scene.add(directionalLight);
  }

  private loadModel(): void {
    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('/draco/');
    dracoLoader.preload();
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      'home/vase.compressed-optimized.glb',
      (gltf) => {
        const model = gltf.scene;

        const box = new Box3().setFromObject(model);
        const center = box.getCenter(new Vector3());
        model.position.sub(center);
        this.basePosition.copy(model.position);
        this.modelHalfHeight = box.getSize(new Vector3()).y / 2;

        model.traverse((child) => {
          if ((child as Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.sourceModel = model;

        if (this.onSourceReadyCallback) {
          this.onSourceReadyCallback(this.sourceModel);
        }

        dracoLoader.dispose();
      },
      (event: ProgressEvent) => {
        if (event.lengthComputable && this.onProgressCallback) {
          const percent = Math.min((event.loaded / event.total) * 100, 100);
          this.onProgressCallback(percent);
        }
      },
      (error) => {
        console.error('Error loading GLB model:', error);
        dracoLoader.dispose();
      },
    );
  }

  public getCamera() {
    return this.camera;
  }

  /** Fires once, as soon as the GLB is parsed and ready to be cloned. */
  public onSourceReady(callback: (source: Group) => void): void {
    this.onSourceReadyCallback = callback;
    if (this.sourceModel) {
      callback(this.sourceModel);
    }
  }

  public onLoadProgress(callback: (percent: number) => void): void {
    this.onProgressCallback = callback;
  }

  /**
   * Swaps whatever's currently in the scene for a brand-new clone of the
   * source model, reset to its canonical resting pose on the pedestal.
   * Returns null if the GLB hasn't finished loading yet; subscribe to
   * onSourceReady() and call again.
   */
  public spawnInstance(): Group | null {
    if (!this.sourceModel) return null;

    if (this.activeInstance) {
      this.scene.remove(this.activeInstance);
      // Deliberately NOT disposing geometry/material — they're shared by
      // reference with sourceModel and any other instance.
    }

    const instance = this.sourceModel.clone(true);
    this.activeInstance = instance;
    this.scene.add(instance);
    this.idleRotationEnabled = true;
    this.applyRestingTransform({ resetRotation: true });

    return instance;
  }

  /** Read-only access to whatever instance is currently mounted, if you need it without spawning a new one. */
  public getActiveInstance(): Group | null {
    return this.activeInstance;
  }

  public setRenderingEnabled(enabled: boolean): void {
    this.renderingEnabled = enabled;
  }

  /** Pause/resume idle auto-rotation, e.g. while a page's GSAP timeline drives rotation itself. */
  public setIdleRotationEnabled(enabled: boolean): void {
    this.idleRotationEnabled = enabled;
  }

  private onWindowResize = (): void => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Re-layout scale/position/camera only — NOT a rotation reset, so a
    // resize never stomps whatever rotation is currently in flight.
    this.applyRestingTransform({ resetRotation: false });
  };

  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.clock.update();

    if (!this.renderingEnabled) return;

    const delta = this.clock.getDelta();

    if (this.activeInstance && this.idleRotationEnabled) {
      this.activeInstance.rotation.y += delta * 0.5;
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Applies breakpoint-correct scale/position/camera framing to the active
   * instance. The vase's Y is derived — pedestal top plus half the model's
   * (scaled) height — so it always sits flush on the pedestal regardless of
   * breakpoint. `resetRotation` is opt-in: "re-layout after resize"
   * (preserve rotation) is a distinct case from "fresh canonical pose"
   * (zero it out).
   */
  private applyRestingTransform(opts: { resetRotation: boolean }): void {
    if (!this.activeInstance) return;

    const width = window.innerWidth;
    let scaleFactor: number;

    if (width < 768) {
      scaleFactor = 1.3;
      this.camera.position.set(0, 4, 14);
    } else if (width < 1024) {
      scaleFactor = 1.8;
      this.camera.position.set(0, 4, 12);
    } else if (width < 1280) {
      scaleFactor = 2.4;
      this.camera.position.set(0, 6, 12);
    } else {
      scaleFactor = 2.9;
      this.camera.position.set(0, 5, 20);
    }

    const centerY = this.VASE_BASE_Y + this.modelHalfHeight * scaleFactor;

    this.activeInstance.scale.set(scaleFactor, scaleFactor, scaleFactor);
    this.activeInstance.position.set(this.basePosition.x, centerY, this.basePosition.z);

    if (opts.resetRotation) {
      this.activeInstance.rotation.set(0, 0, 0);
    }

    this.camera.lookAt(new Vector3(0, centerY, 0));
  }

  setupCleanup(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    window.removeEventListener('resize', this.onWindowResize);
    this.renderer.dispose();
    this.scene.clear();
  }
}
