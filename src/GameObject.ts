import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, CARD_HEIGHT, CARD_WIDTH, COL_LENGTH, ROW_LENGTH } from './utility';


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
        let xStartPosition = 30;
        let yStartPosition = 10;
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
                console.log(yStartPosition);
            }
            yStartPosition += 270;
            xStartPosition = 30;
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
            card.backSprite.interactive = true;
            card.flip()

            card.backSprite.scale.x = 0.14;
            card.backSprite.scale.y = 0.14;
            card.backSprite.anchor.set(0.5, 0.5)

            card.sprite.scale.x = 0.4;
            card.sprite.scale.y = 0.4;
            card.sprite.anchor.set(0.5, 0.5)

            const rowSpacing = 40;
            const columnSpacing = card.sprite.width + 90;
            const xStart = 116;
            const yStart = 410;
            const excludedIndices = [7, 14, 15, 21, 22, 23, 28, 29, 30, 31, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47];


            if (excludedIndices.includes(i)) {
                this.deck.push(card);
                continue;
            } else if (i < 49) {
                card.sprite.x = (i % 7) * columnSpacing + xStart;
                card.backSprite.x = card.sprite.x;
                card.sprite.y = yStart + Math.floor(i / 7) * (rowSpacing)
                card.backSprite.y = card.sprite.y;

            } else {
                card.sprite.x = 110;
                card.backSprite.x = card.sprite.x;
                card.sprite.y = 140;
                card.backSprite.y = card.sprite.y;
            }

            this.deck.push(card);
            this.app.stage.addChild(card.sprite, card.backSprite);

            //generateMask
            const cardMask = card.generateMask(card.sprite.x, card.sprite.y);

            this.app.stage.addChild(cardMask);

            xClubsStartpoint += 458;
            if (xClubsStartpoint >= ASSET_WIDTH - 300) {
                xClubsStartpoint = 42;
                yClubsStartpoint += 660;

                if (yClubsStartpoint >= ASSET_HEIGHT - 630) {
                    break;
                }
            }
        }
        console.log(this.deck);
    }

    public generateAllMask() {
        this.deck.forEach((c) => {
            const m = c.generateMask(32, 280);
            c.sprite.mask = m;
            this.app.stage.addChild(m);
        })
    }

    public async loadTextures() {
        return [PIXI.Texture.from(`assets/22331.jpg`), PIXI.Texture.from(`assets/back.png`)];
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