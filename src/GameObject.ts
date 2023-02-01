import * as PIXI from 'pixi.js';
import { COL_LENGTH, ROW_LENGTH } from './utility';


const gameSection = document.getElementById('game');
let created: boolean = false;

export class GameObject {
    private app: PIXI.Application;
    private cards: PIXI.Sprite[];

    constructor() {
        if (created == false) {
            this.app = new PIXI.Application({
                width: 1800,
                height: 840,
                background: 0x999999
            });
            gameSection.appendChild(this.app.view as HTMLCanvasElement);
            created = true;
        }
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

    public async generateCard() {
        const sprites: PIXI.Sprite[] = [];
        //const cardTypes = ['C', 'H', 'S', 'D'];

        const texture = await this.loadTextures();

        // create a rectangle for each card
        let x = 50;
        let y = 850;
        const cardsPerRow = 13;



        for (let i = 0; i < 52; i++) {
            const sprite = new PIXI.Sprite(new PIXI.Texture(texture.baseTexture, new PIXI.Rectangle(x, y, 415, 630)));

            sprite.scale.x = 0.4;
            sprite.scale.y = 0.4;

            // position the sprite
            sprite.x = (i % 13) * (sprite.width + 10) + 10;
            sprite.y = Math.floor(i / 13) * (sprite.height + 10) + 10;

            sprites.push(sprite);
            this.app.stage.addChild(sprite);

            // update x and y for the next card
            x += 458;
            if (x >= 6000) {
                x = 42;
                y += 656;
            }

            sprite.x = 25;
            sprite.y = 13;
        }
    }

    public async loadTextures() {
        return PIXI.Texture.from(`assets/22331.jpg`);
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