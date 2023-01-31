import * as PIXI from 'pixi.js';

export class GameObject {

    private app: PIXI.Application;
    private cards: PIXI.Sprite[];   

    constructor() {
        this.app = new PIXI.Application({
            width: 1800,
            height: 840,
            background: 0x999999
        });
        document.body.appendChild(this.app.view as HTMLCanvasElement);
    }

    public generateBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x005600);
        background.drawRect(0, 0, 1800, 840);
        background.endFill();
        this.app.stage.addChild(background);
    }
}