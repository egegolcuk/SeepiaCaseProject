export class KeyboardInput {
  constructor() {
    this._init();
  }

  _init() {
    this._keys = {
      isForwardDown: false,
      isBackwardDown: false,
      isLeftDown: false,
      isRightDown: false,
      isSpaceDown: false,
      isShiftDown: false,
    };
    this._animKeys = {
      isOneDown: false,
      isTwoDown: false,
      isThreeDown: false,
      isFourDown: false,
    };
    
    document.addEventListener('keydown', (e) => this._onKeyDown(e), false);
    document.addEventListener('keyup', (e) => this._onKeyUp(e), false);
  }

  _onKeyDown(event) {
    this._handleKeyEvent(event.keyCode, true);
  }

  _onKeyUp(event) {
    this._handleKeyEvent(event.keyCode, false);
  }

  _handleKeyEvent(keyCode, status) {

    const KEY_W = 87, KEY_A = 65, KEY_S = 83, KEY_D = 68, KEY_SPACE = 32, KEY_SHIFT = 16, KEY_1 = 49, KEY_2 = 50, KEY_3 = 51, KEY_4 = 52, KEY_5 = 53; 

    switch (keyCode) {
      case KEY_W: this._keys.isForwardDown = status; break;
      case KEY_A: this._keys.isLeftDown = status; break;
      case KEY_S: this._keys.isBackwardDown = status; break;
      case KEY_D: this._keys.isRightDown = status; break;
      case KEY_SPACE: this._handleSpaceKey(status); break;
      case KEY_SHIFT: this._keys.isShift = status; break;
      case KEY_1: this._animKeys.isOneDown = status; break;
      case KEY_2: this._animKeys.isTwoDown = status; break;
      case KEY_3: this._animKeys.isThreeDown = status; break;
      case KEY_4: this._animKeys.isFourDown = status; break;
    }
  }
  _handleSpaceKey(status) {
    //zıplama mekaniği
  }

  get keys() {
    return this._keys;
  }
  get animKeys() {
    return this._animKeys;
  }
}