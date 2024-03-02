import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.118.1/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.118/examples/jsm/controls/OrbitControls.js';
import { BackgroundRenderer } from './backgroundRenderer.js';
import { Movement } from './movement.js';

export class Game {
  constructor() {
    this._initialize();
    this.pixiBackground = new BackgroundRenderer();
  }

  _initialize() {
    this._setupRenderer();
    this._setupScene();
    this._setupCamera();
    this._setupLights();
    this._setupControls();
    this._setupGround();
    this._loadModel();
    this._setupEventListeners();
    this._runAnimationLoop();
  }

  _setupRenderer() {
    this._threejs = new THREE.WebGLRenderer({ alpha: true });
    this._threejs.setClearColor(0x000000, 0);
    this._threejs.outputEncoding = THREE.sRGBEncoding;
    this._threejs.shadowMap.enabled = true;
    this._threejs.shadowMap.type = THREE.PCFSoftShadowMap;
    this._threejs.setPixelRatio(window.devicePixelRatio);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this._threejs.domElement);
  }

  _setupScene() {
    this._scene = new THREE.Scene();
  }

  _setupCamera() {
    const fov = 60;
    const aspect = window.innerWidth / window.innerHeight;
    const near = 1.0;
    const far = 1000.0;
    this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this._camera.position.set(25, 10, 25);
  }

  _setupLights() {
    const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    directionalLight.position.set(100, 100, 100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.castShadow = true;
    this._scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.25);
    this._scene.add(ambientLight);
  }

  _setupControls() {
    const controls = new OrbitControls(this._camera, this._threejs.domElement);
    controls.target.set(0, 10, 0);
    controls.update();
  }

  _setupGround() {
    const textureLoader = new THREE.TextureLoader();
    const groundTexture = textureLoader.load('./resources/grass.jpg');

    const plane = new THREE.Mesh(
      new THREE.PlaneGeometry(100, 100, 10, 10),
      new THREE.MeshStandardMaterial({ map: groundTexture })
    );

    plane.castShadow = false;
    plane.receiveShadow = true;
    plane.rotation.x = -Math.PI / 2;

    this._scene.add(plane);
  }


  _loadModel() {
    const loader = new GLTFLoader();
    const textureLoader = new THREE.TextureLoader();
    const clock = new THREE.Clock();
    let mixer;

    const texture = textureLoader.load('./resources/models/ninja/ninja.png');

    loader.load('./resources/models/ninja/cibus_ninja.glb', (gltf) => {
      gltf.scene.traverse(c => {
        if (c.isMesh) {
          c.material.side = THREE.DoubleSide;
          c.material.map = texture;
          c.castShadow = true;
        }
      });

      this._scene.add(gltf.scene);

      let action;
      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(gltf.scene);
        action = mixer.clipAction(gltf.animations[4]);
        action.play();
      } else {
        console.error("No animations found in the loaded model.");
      }

      const params = {
        target: gltf.scene,
      };

      this._controls = new Movement(params);
      this._controls.setAnimationMixer(mixer, action, gltf);

      this._render();
    });

    this._render = () => {
      requestAnimationFrame(this._render);

      if (mixer) {
        mixer.update(clock.getDelta());
      }

      this._threejs.render(this._scene, this._camera);
    };
  }

  _setupEventListeners() {
    window.addEventListener('resize', () => this._onWindowResize(), false);
  }

  _onWindowResize() {
    this._camera.aspect = window.innerWidth / window.innerHeight;
    this._camera.updateProjectionMatrix();
    this.pixiBackground.resize(window.innerWidth, window.innerHeight);
    this._threejs.setSize(window.innerWidth, window.innerHeight);
  }

  _runAnimationLoop() {
    const animate = (t) => {
      if (this._previousRAF === null) {
        this._previousRAF = t;
      }

      this._runAnimationLoop();

      this.pixiBackground.render();

      this._threejs.render(this._scene, this._camera);

      this._step(t - this._previousRAF);

      this._previousRAF = t;
    };

    requestAnimationFrame(animate);
  }

  _step(timeElapsed) {
    const SECONDS_TO_MILLISECONDS = 0.001;
    const timeElapsedS = timeElapsed * SECONDS_TO_MILLISECONDS;

    if (this._controls) {
      this._controls.Update(timeElapsedS);
    }
  }
}
