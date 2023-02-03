import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, CARD_HEIGHT, CARD_WIDTH, COL_LENGTH, ROW_LENGTH, slotPositions } from './utility';


const gameSection = document.getElementById('game');
let created: boolean = false;

export class GameObject {
    private app: PIXI.Application;
    private deck: Card[] = [];

    constructor() {
        if (created == false) {
            this.app = new PIXI.Application({
                width: APP_WIDTH,
                height: APP_HEIGHT,
                background: 0x999999
            });
            gameSection.appendChild(this.app.view as HTMLCanvasElement);
            created = true;
        }
    }

    public generateBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x005600);
        background.drawRect(0, 0, APP_WIDTH, APP_HEIGHT);
        background.endFill();
        this.app.stage.addChild(background);
    }

    public genaratePlaces() {
        let xStartPosition = 113;
        let yStartPosition = 137;
        for (let row = 0; row < ROW_LENGTH; row++) {
            for (let col = 0; col < COL_LENGTH; col++) {
                if (row == 0 && col == 2) {
                    xStartPosition += 256
                    continue;
                }
                const place = this.generateSinglePlace();
                place.position.set(xStartPosition, yStartPosition);
                this.app.stage.addChild(place);
                xStartPosition += 256;
                slotPositions.push(place);
            }
            yStartPosition += 270;
            xStartPosition = 113;
        }
    }

    public async generateCards() {
        const suits = ["spades", "hearts", "diamonds", "clubs"];
        const texture = await this.loadTextures();

        let xClubsStartpoint = 50;
        let yClubsStartpoint = 848;

        for (let i = 0; i < 52; i++) {

            const number = i % 13;
            const suit = suits[Math.floor(i / 13)];
            const card = new Card(number, suit);
            card.sprite = new PIXI.Sprite(new PIXI.Texture(texture[0].baseTexture, new PIXI.Rectangle(xClubsStartpoint, yClubsStartpoint, CARD_WIDTH, CARD_HEIGHT)));

            card.backSprite = new PIXI.Sprite(texture[1]);
            card.container.interactive = true;
            card.container.pivot.x = card.container.width / 2;
            card.container.pivot.y = card.container.height / 2;
            card.flip()
            // card.moveTo();

            card.backSprite.scale.x = 0.14;
            card.backSprite.scale.y = 0.14;
            card.backSprite.anchor.set(0.5, 0.5)

            card.sprite.scale.x = 0.4;
            card.sprite.scale.y = 0.4;
            card.sprite.anchor.set(0.5, 0.5);

            card.sprite.x = card.sprite.x - card.container.x;
            card.sprite.y = card.sprite.y - card.container.y;
            card.backSprite.x = card.sprite.x - card.container.x;
            card.backSprite.y = card.sprite.y - card.container.y;

            //constants
            const rowSpacing = 40;
            const columnSpacing = card.sprite.width + 90;
            const xStart = 116;
            const yStart = 410;
            const excludedIndices = [7, 14, 15, 21, 22, 23, 28, 29, 30, 31, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47];



            if (excludedIndices.includes(i)) {
                card.container.x = slotPositions[0].x;
                card.container.y = slotPositions[0].y;

            } else if (i < 49) {
                card.container.x = (i % 7) * columnSpacing + xStart;
                card.container.y = yStart + Math.floor(i / 7) * (rowSpacing)
            } else {
                card.container.x = slotPositions[0].x;
                card.container.y = slotPositions[0].y;
            }

            this.deck.push(card);

            //generate Mask
            const cardMask = card.generateMask(card.sprite.x, card.sprite.y);

            //add to Stage
            card.container.addChild(card.sprite, card.backSprite, cardMask);
            this.app.stage.addChild(card.container);

            xClubsStartpoint += 458;
            if (xClubsStartpoint >= ASSET_WIDTH - 300) {
                xClubsStartpoint = 42;
                yClubsStartpoint += 660;

                if (yClubsStartpoint >= ASSET_HEIGHT - 630) {
                    break;
                }
            }
        }
    }

    public generateAllMask() {
        this.deck.forEach((c) => {
            const m = c.generateMask(32, 280);
            c.container.mask = m;
        })
    }

    public async loadTextures() {
        return [PIXI.Texture.from(`assets/22331.jpg`), PIXI.Texture.from(`assets/back.png`)];
    }

    private generateSinglePlace() {
        const place = new PIXI.Graphics();
        place.beginFill(0x008000);
        place.drawRoundedRect(0, 0, 160, 247, 15);
        place.endFill();
        place.pivot.x = place.width / 2;
        place.pivot.y = place.height / 2;


        return place;
    }
}