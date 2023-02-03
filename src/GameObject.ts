import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, CARD_HEIGHT, CARD_WIDTH, COL_LENGTH, ROW_LENGTH, slotPositions } from './utility';
import { gsap } from 'gsap';


const gameSection = document.getElementById('game');
let created: boolean = false;

export class GameObject {
    private app: PIXI.Application;
    private deck: Card[] = [];
    private smallDeck: Card[] = [];

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
        const suits = ["clubs", "hearts", "spades", "diamonds"];
        const texture = await this.loadTextures();

        let xClubsStartpoint = 50;
        let yClubsStartpoint = 848;

        for (let i = 0; i < 52; i++) {

            const number = (i + 1) % 13;
            const suit = suits[Math.floor(i / 13)];
            const card = new Card(number, suit);

            card.backSprite = new PIXI.Sprite(texture[1]);
            card.container.interactive = true;
            card.container.pivot.x = card.container.width / 2;
            card.container.pivot.y = card.container.height / 2;
            card.flip()
            card.moveTo(this.deck);
            card.sprite = new PIXI.Sprite(new PIXI.Texture(texture[0].baseTexture,
                new PIXI.Rectangle(xClubsStartpoint, yClubsStartpoint, CARD_WIDTH, CARD_HEIGHT)));

            // calibrating
            this.calibratingCard(card, texture);

            this.deck.push(card);

            //generate Mask
            const cardMask = card.generateMask(card.sprite.x, card.sprite.y);

            //add to Container
            card.container.addChild(card.sprite, card.backSprite, cardMask);

            //cutting every single card
            xClubsStartpoint += 458;
            if (xClubsStartpoint >= ASSET_WIDTH - 300) {
                xClubsStartpoint = 42;
                yClubsStartpoint += 660;

                if (yClubsStartpoint >= ASSET_HEIGHT - 630) {
                    break;
                }
            }
        }
        //rendering Cards
        this.renderCard();

        this.deck.forEach((c, index) => {
            const top = this.deck[this.deck.length - 1];
            if (index === this.deck.length - 1) {
                top.container.interactive = true;
                top.container.on('pointertap', () => {

                    if (this.deck.length > 0) {
                        this.deck.pop();
                        const topCard = this.deck[this.deck.length - 1];
                        this.moveTopCardToSlot1(topCard);
                        console.log('yes');
                    } else {
                        console.log('no');
                        console.log(this.deck);
                    }
                });
            }
        });
        //console.log(this.deck);
    }

    public renderCard() {
        //this.shuffleDeck();

        for (let i = 0; i < this.deck.length; i++) {
            //constants
            const card = this.deck[i];
            const rowSpacing = 40;
            const columnSpacing = card.sprite.width + 90;
            const xStart = 116;
            const yStart = 410;
            const excludedIndices = [7, 14, 15, 21, 22, 23, 28, 29, 30, 31, 35, 36, 37, 38, 39, 42, 43, 44, 45, 46, 47];

            //POSITION CARDS ON STAGE

            if (excludedIndices.includes(i)) {
                card.container.x = slotPositions[0].x;
                card.container.y = slotPositions[0].y;
                this.smallDeck.push(card);

            } else if (i < 49) {
                card.container.x = (i % 7) * columnSpacing + xStart;
                card.container.y = yStart + Math.floor(i / 7) * (rowSpacing)
            } else {
                card.container.x = slotPositions[0].x;
                card.container.y = slotPositions[0].y;
                this.smallDeck.push(card);
            }
            this.app.stage.addChild(card.container);
        };
    }

    private moveTopCardToSlot1(topCard: Card) {
        if (slotPositions[1] && this.deck.length > 0) {
            this.app.stage.addChild(topCard.container);
            gsap.to(topCard.container, {
                pixi: { x: slotPositions[1].x, y: slotPositions[1].y }, duration: 0.1, onComplete: () => {
                    topCard.flip();
                    console.log(`${topCard.suit} -> ${topCard.rank}`);
                }
            });
        }
    }

    public generateAllMask() {
        this.deck.forEach((c) => {
            const m = c.generateMask(32, 280);
            c.container.mask = m;
        })
    }

    private async loadTextures() {
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

    private shuffleDeck() {
        this.deck.sort(function () {
            return Math.random() - 0.5;
        });
    }

    private calibratingCard(card: Card, texture: PIXI.Texture[]) {
        card.backSprite = new PIXI.Sprite(texture[1]);
        card.container.interactive = true;
        card.container.pivot.x = card.container.width / 2;
        card.container.pivot.y = card.container.height / 2;
        //card.flip()
        //card.moveTo();

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
    }
}