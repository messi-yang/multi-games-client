import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { Font, FontLoader } from 'three/examples/jsm/loaders/FontLoader';

import { PositionVo } from '@/models/world/common/position-vo';
import { PrecisePositionVo } from '@/models/world/common/precise-position-vo';
import { PlayerModel } from '@/models/world/player/player-model';
import { createTextMesh } from './tjs-utils';
import { EventHandler, EventHandlerSubscriber } from '@/event-dispatchers/common/event-handler';

const CAMERA_FOV = 50;
const HEMI_LIGHT_HEIGHT = 20;
const DIR_LIGHT_HEIGHT = 20;
const DIR_LIGHT_Z_OFFSET = 20;
const PLAYER_NAME_HEIGHT = 2;
const PIXEL_RATIO = 2;
const SKY_COLOR = 0x4682b4;
const DEFAULT_FONT_SRC = 'https://cdn.jsdelivr.net/npm/three/examples/fonts/droid/droid_sans_regular.typeface.json';
const CHARACTER_MODEL_SRC = '/characters/a-chiong.gltf';
const HOVER_INDICATOR_COLOR_GREEN = 0x00ff00;

export class WorldRenderer {
  private readonly scene: THREE.Scene;

  private camera: THREE.PerspectiveCamera;

  private readonly renderer: THREE.WebGLRenderer;

  private readonly directionalLight: THREE.DirectionalLight;

  private baseModelDownloadedEventSubscribers = EventHandler.create<void>();

  private fontMap: Record<string, Font | undefined> = {};

  private defaultFontDownloadedEventSubscribers = EventHandler.create<void>();

  private existingPlayerNameFontMeshesMap: Record<string, THREE.Mesh> = {};

  private itemModelInstancesCleanerMap: Record<string, (() => void) | undefined> = {};

  private baseModelInstancesCleaner: () => void = () => {};

  private playerInstancesMap: Map<string, [character: THREE.Group, name: THREE.Mesh]> = new Map();

  private playerModel: THREE.Group | null = null;

  private playerModelDownloadedEventSubscribers = EventHandler.create<void>();

  private mouseClientPosition: { x: number; y: number } = { x: 0, y: 0 };

  private selectedBoundIndicator: THREE.Mesh;

  private touchPanel: THREE.Mesh;

  private positionHoverEventHandler = EventHandler.create<PositionVo>();

  private positionHoverIndicator: THREE.Mesh;

  constructor() {
    this.scene = this.createScene();

    this.camera = this.createCamera();

    this.directionalLight = this.createDirectionalLight();
    this.scene.add(this.directionalLight);
    this.scene.add(this.directionalLight.target);

    this.renderer = this.createRenderer();

    this.downloadDefaultFont(DEFAULT_FONT_SRC);
    this.downloadPlayerModel();

    this.selectedBoundIndicator = new THREE.Mesh(
      new THREE.BoxGeometry(1, 2, 1),
      new THREE.MeshBasicMaterial({ color: 0x00ff00, opacity: 0.5, transparent: true })
    );
    this.selectedBoundIndicator.position.set(0, -100, 0);
    this.scene.add(this.selectedBoundIndicator);

    this.positionHoverIndicator = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.1, 1),
      new THREE.MeshBasicMaterial({ color: HOVER_INDICATOR_COLOR_GREEN, opacity: 0.5, transparent: true })
    );
    this.positionHoverIndicator.position.set(0, -100, 0);
    this.scene.add(this.positionHoverIndicator);

    this.touchPanel = new THREE.Mesh(
      new THREE.BoxGeometry(100, 1, 100),
      new THREE.MeshBasicMaterial({ color: 0x000000, opacity: 0, transparent: true })
    );
    this.touchPanel.position.set(0, -0.5, 0);

    this.scene.add(this.touchPanel);
  }

  static create() {
    return new WorldRenderer();
  }

  public render() {
    this.renderer.render(this.scene, this.camera);
  }

  public mount(element: HTMLElement) {
    element.appendChild(this.renderer.domElement);
  }

  public destroy(element: HTMLElement) {
    this.baseModelInstancesCleaner();

    Object.values(this.existingPlayerNameFontMeshesMap).forEach((mesh) => {
      this.scene.remove(mesh);
    });

    Object.values(this.itemModelInstancesCleanerMap).forEach((cleaner) => {
      cleaner?.();
    });

    this.baseModelInstancesCleaner();

    element.removeChild(this.renderer.domElement);
  }

  private async downloadFont(fontSrc: string): Promise<Font> {
    const fontLoader = new FontLoader();
    return new Promise((resolve) => {
      fontLoader.load(fontSrc, (font) => {
        resolve(font);
      });
    });
  }

  private async downloadDefaultFont(fontSource: string) {
    const playerFont = await this.downloadFont(fontSource);
    this.fontMap[fontSource] = playerFont;

    this.defaultFontDownloadedEventSubscribers.publish();
  }

  private async downloadModel(modelSource: string) {
    const gltfLoader = new GLTFLoader();
    return new Promise<THREE.Group>((resolve) => {
      gltfLoader.load(modelSource, function (gltf) {
        gltf.scene.traverse((node) => {
          if (node instanceof THREE.Mesh) {
            const nextNode = node as THREE.Mesh;
            nextNode.castShadow = true;
            nextNode.receiveShadow = true;
            nextNode.frustumCulled = true;
          }
        });
        resolve(gltf.scene);
      });
    });
  }

  private async downloadPlayerModel() {
    this.playerModel = await this.downloadModel(CHARACTER_MODEL_SRC);
    this.playerModelDownloadedEventSubscribers.publish();
  }

  public subscribePlayerModelDownloadedEvent(subscriber: EventHandlerSubscriber<void>): () => void {
    return this.playerModelDownloadedEventSubscribers.subscribe(subscriber);
  }

  public subscribeBaseModelsDownloadedEvent(subscriber: EventHandlerSubscriber<void>): () => void {
    return this.baseModelDownloadedEventSubscribers.subscribe(subscriber);
  }

  public subscribeDefaultFontDownloadedEvent(subscriber: EventHandlerSubscriber<void>): () => void {
    return this.defaultFontDownloadedEventSubscribers.subscribe(subscriber);
  }

  public printRendererInfomation(): void {
    console.log(`Render Information: ${JSON.stringify(this.renderer.info.render)}`);
  }

  private updateCameraAspect(width: number, height: number) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private updateRendererSize(width: number, height: number) {
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(PIXEL_RATIO);
  }

  public updateCanvasSize(width: number, height: number) {
    this.updateCameraAspect(width, height);
    this.updateRendererSize(width, height);
  }

  public updateCameraPosition(cameraPosition: PrecisePositionVo, targetPrecisePos: PrecisePositionVo) {
    this.camera.position.set(cameraPosition.getX(), cameraPosition.getY(), cameraPosition.getZ());
    this.camera.lookAt(targetPrecisePos.getX(), 0, targetPrecisePos.getZ());
  }

  private createScene() {
    const newScene = new THREE.Scene();
    newScene.background = new THREE.Color(SKY_COLOR);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1);
    hemiLight.position.set(0, HEMI_LIGHT_HEIGHT, 0);
    newScene.add(hemiLight);

    return newScene;
  }

  private createCamera(): THREE.PerspectiveCamera {
    return new THREE.PerspectiveCamera(CAMERA_FOV, 1, 0.1, 1000);
  }

  private createDirectionalLight(): THREE.DirectionalLight {
    const newDirLight = new THREE.DirectionalLight(0xffffff, 1);
    newDirLight.castShadow = true;
    newDirLight.position.set(-10, DIR_LIGHT_HEIGHT, DIR_LIGHT_Z_OFFSET);
    newDirLight.target.position.set(0, 0, 0);
    newDirLight.shadow.mapSize.set(4096, 4096);
    newDirLight.shadow.camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 0.5, 500);

    return newDirLight;
  }

  private createRenderer(): THREE.WebGLRenderer {
    const newRenderer = new THREE.WebGLRenderer({ antialias: true });
    newRenderer.shadowMap.enabled = true;
    newRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    return newRenderer;
  }

  public updatePlayer(player: PlayerModel): void {
    const font = this.fontMap[DEFAULT_FONT_SRC];
    if (!font) return;

    if (!this.playerModel) return;

    const playerId = player.getId();

    const playerInstances = this.playerInstancesMap.get(playerId);
    if (playerInstances) {
      const [playerCharacterInstance, playerNameInstance] = playerInstances;
      playerCharacterInstance.position.set(player.getPrecisePosition().getX(), 0, player.getPrecisePosition().getZ());
      playerCharacterInstance.rotation.set(0, (player.getDirection().toNumber() * Math.PI) / 2, 0);

      playerNameInstance.position.set(player.getPrecisePosition().getX(), PLAYER_NAME_HEIGHT, player.getPrecisePosition().getZ());
    } else {
      const newPlayerInstance = this.playerModel.clone();
      newPlayerInstance.position.set(player.getPrecisePosition().getX(), 0, player.getPrecisePosition().getZ());
      newPlayerInstance.rotation.set(0, (player.getDirection().toNumber() * Math.PI) / 2, 0);
      this.scene.add(newPlayerInstance);

      const newPlayerNameInstance = createTextMesh(
        font,
        player.getName(),
        player.getPrecisePosition().getX(),
        PLAYER_NAME_HEIGHT,
        player.getPrecisePosition().getZ()
      );
      this.scene.add(newPlayerNameInstance);

      this.playerInstancesMap.set(playerId, [newPlayerInstance, newPlayerNameInstance]);
    }
  }

  public removePlayer(player: PlayerModel): void {
    const playerId = player.getId();
    const playerInstances = this.playerInstancesMap.get(playerId);
    if (!playerInstances) return;

    const [playerCharacterInstance, playerNameInstance] = playerInstances;
    this.scene.remove(playerCharacterInstance);
    this.scene.remove(playerNameInstance);
  }

  public getCanvasPosition(position: PrecisePositionVo | PositionVo) {
    this.camera.updateProjectionMatrix();
    const vector = new THREE.Vector3(position.getX(), position.getY(), position.getZ());
    vector.project(this.camera);

    // Remember to divide by the pixel ratio
    const canvasWidth = this.renderer.domElement.width / PIXEL_RATIO;
    const canvasHeight = this.renderer.domElement.height / PIXEL_RATIO;

    const x = ((vector.x + 1) * canvasWidth) / 2;
    const y = -((vector.y - 1) * canvasHeight) / 2;

    return { x, y };
  }
}
