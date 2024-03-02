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

    const backgroundImageUrl = './resources/background.jpg';
    const texture = PIXI.Texture.from(backgroundImageUrl);
    const background = new PIXI.Sprite(texture);
    background.width = window.innerWidth;
    background.height = window.innerHeight;

    this.container.addChild(background);
  }

  resize(width, height) {
    this.app.renderer.resize(width, height);
    this.container.children[0].width = width;
    this.container.children[0].height = height;
  }

  render() {
    this.app.renderer.render(this.container, this.app.stage);
  }
}
