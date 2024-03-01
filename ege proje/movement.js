import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.118/build/three.module.js';
import { KeyboardInput } from './input.js';

export class Movement {
  constructor(params) {
    this._initialize(params);
  }

  _initialize(params) {
    this._params = params;
    this._deceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    this._acceleration = new THREE.Vector3(1, 0.25, 50.0);
    this._velocity = new THREE.Vector3(0, 0, 0);
    this._input = new KeyboardInput();
    this._animationMixer = null;
    this._animationAction = null;
    this._gltf = null;
  }

  setAnimationMixer(mixer, action, gltf) {
    this._animationMixer = mixer;
    this._animationAction = action;
    this._gltf = gltf;
  }

  Update(timeInSeconds) {
    this._updateVelocity(timeInSeconds);
    this._updateRotation(timeInSeconds);
    this._updatePosition(timeInSeconds);
    this._updateAnimation();
  }

  _updateAnimation() {
    if (this._animationMixer && this._animationAction) {
      const animKeys = this._input._animKeys;
      const index = animKeys.isOneDown ? 0 : animKeys.isTwoDown ? 1 : animKeys.isThreeDown ? 2 : animKeys.isFourDown ? 3 : null;

      if (index !== null) {
        this._playAnimationByIndex(index);
      }
    }
  }

  _playAnimationByIndex(index) {
    const clip = this._animationMixer.clipAction(this._gltf.animations[index]);
    if (clip) {
      this._stopAnimation();
      this._animationAction = clip;
      this._animationAction.reset().setLoop(THREE.LoopOnce, 1).fadeIn(0.5);

      const startTime = Date.now();
      const checkProgress = () => {
        const elapsedTime = Date.now() - startTime;
        const duration = this._animationAction.getClip().duration * 1000;

        if (elapsedTime >= duration) {
          this.onAnimationEnd();
        } else {
          requestAnimationFrame(checkProgress);
        }
      };

      requestAnimationFrame(checkProgress);
      this._animationAction.play();
    } else {
      console.error(`No animation found for index ${index}.`);
    }
  }

  onAnimationEnd() {
    const clip = this._animationMixer.clipAction(this._gltf.animations[4]);
    this._animationAction = clip;
    this._animationAction.play();
  }

  _stopAnimation() {
    if (this._animationAction) {
      this._animationAction.stop();
    }
  }

  _updateVelocity(timeInSeconds) {
    let velocity = this._velocity;
    const frameDecceleration = velocity.clone().multiply(this._deceleration).multiplyScalar(timeInSeconds);
    frameDecceleration.z = Math.sign(frameDecceleration.z) * Math.min(
      Math.abs(frameDecceleration.z),
      Math.abs(velocity.z)
    );

    velocity.add(frameDecceleration);

    const acc = this._acceleration.clone().multiplyScalar(this._input._keys.isShiftDown ? 2.0 : 1.0);
    if (this._input._keys.isForwardDown) {
      velocity.z += acc.z * timeInSeconds;
    }
    if (this._input._keys.isBackwardDown) {
      velocity.z -= acc.z * timeInSeconds;
    }
  }

  _updateRotation(timeInSeconds) {
    const controlObject = this._params.target;
    const rotationQuaternion = new THREE.Quaternion();
    const rotationAxis = new THREE.Vector3();
    const currentRotation = controlObject.quaternion.clone();

    if (this._input._keys.isLeftDown) {
      this._rotateObject(rotationAxis, rotationQuaternion, currentRotation, 1, timeInSeconds);
    }
    if (this._input._keys.isRightDown) {
      this._rotateObject(rotationAxis, rotationQuaternion, currentRotation, -1, timeInSeconds);
    }

    controlObject.quaternion.copy(currentRotation);
  }

  _rotateObject(axis, quaternion, currentRotation, direction, timeInSeconds) {
    axis.set(0, 1, 0);
    quaternion.setFromAxisAngle(
      axis,
      direction * 4.0 * Math.PI * timeInSeconds * this._acceleration.y
    );
    currentRotation.multiply(quaternion);
  }


  _updatePosition(timeInSeconds) {
    const controlObject = this._params.target;
    const forward = new THREE.Vector3(0, 0, 1).applyQuaternion(controlObject.quaternion).normalize();
    const sideways = new THREE.Vector3(1, 0, 0).applyQuaternion(controlObject.quaternion).normalize();

    sideways.multiplyScalar(this._velocity.x * timeInSeconds);
    forward.multiplyScalar(this._velocity.z * timeInSeconds);

    controlObject.position.add(forward).add(sideways);
  }
}
