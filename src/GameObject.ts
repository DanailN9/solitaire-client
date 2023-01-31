import * as PIXI from 'pixi.js';
import { COL_LENGTH, ROW_LENGTH } from './utility';

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

    public genaratePlaces() {
        let xStartPosition = 30;
        let yStartPosition = 10;
        for (let row = 0; row < ROW_LENGTH; row++) {
            for (let col = 0; col < COL_LENGTH; col++) {
                if (row == 2) {
                    continue;
                };
                const place = this.generateSinglePlace();
                place.position.set(xStartPosition, yStartPosition);
                this.app.stage.addChild(place);
                yStartPosition += 270;
            }
            yStartPosition = 10;
            xStartPosition += 262;
        }
        const lastPlace = this.generateSinglePlace();
        lastPlace.position.set(554, 280);
        this.app.stage.addChild(lastPlace);
    }

    private generateSinglePlace() {
        const place = new PIXI.Graphics();
        place.beginFill(0x008000);
        place.drawRoundedRect(3, 3, 160, 247, 15);
        place.endFill();
        place.position.set(0, 0)

        return place;
    }
}