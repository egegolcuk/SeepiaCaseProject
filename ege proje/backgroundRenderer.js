
export class BackgroundRenderer {
  constructor() {
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      transparent: false,
    });

    this.app.view.style.position = "fixed";
    this.app.view.style.left = "0";
    this.app.view.style.top = "0";
    this.app.view.style.zIndex = "-1";

    document.body.appendChild(this.app.view);

    this.container = new PIXI.Container();
    this.app.stage.addChild(this.container);

    const backgroundColor = 0x12345;
    const background = new PIXI.Graphics();
    background.beginFill(backgroundColor);
    background.drawRect(0, 0, window.innerWidth, window.innerHeight);
    background.endFill();

    this.container.addChild(background);
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
  }

  render() {
    this.app.renderer.render(this.container, this.app.stage);
  }
}
