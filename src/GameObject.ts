import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, CARD_HEIGHT, CARD_WIDTH, COL_LENGTH, gameInfo, pilesContainer, ROW_LENGTH, slotPositions } from './utility';
import { gsap } from 'gsap';

const gameSection = document.getElementById('game');
let created: boolean = false;

export class GameObject {
    private app: PIXI.Application;
    private deck: Card[] = [];
    private slotOneCards: Card[] = [];
    private state: any;
    private moves: any;
    public lastSelectedCard = false;
    public lastSelectedCardArray: PIXI.Container[] = [];
    private deckLayer: PIXI.Container;
    private overLayer: PIXI.Container;

    constructor() {
        if (created == false) {
            this.app = new PIXI.Application({
                width: APP_WIDTH,
                height: APP_HEIGHT,
                background: 0x999999
            });
            gameSection.appendChild(this.app.view as HTMLCanvasElement);
            created = true;
            this.deckLayer = new PIXI.Container();
            this.deckLayer.position.set(0, 0);
            this.overLayer = new PIXI.Container();
            this.overLayer.position.set(0, 0);
        }
    }

    public generateBackground() {
        const background = new PIXI.Graphics();
        background.beginFill(0x005600);
        background.drawRect(0, 0, APP_WIDTH, APP_HEIGHT);
        background.endFill();
        this.app.stage.addChild(background);
        return background;
    }

    public genaratePlaces(background: PIXI.Graphics) {
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
                background.addChild(place);
                xStartPosition += 256;
                slotPositions.push(place);
            }
            yStartPosition += 270;
            xStartPosition = 113;
        }
    }

    public backflip(card: Card) {
        card.container.on('pointertap', () => {
            this.flipToFront(card);
        });
    }

    public flipToFront(card: Card) {
        if (card.fliped === false) {
            gsap.to(card.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(card.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.4, skewY: 0 }, duration: 0.1, delay: 0.1 });
            card.fliped = true;
            this.moveTo(card);
        }
    }

    public flipToBack(card: Card) {
        if (card.fliped === true) {
            gsap.to(card.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(card.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.14, skewY: 0 }, duration: 0.1, delay: 0.1 });
            card.fliped = false;
        }
    }

    public moveTo(card: Card) {
        //WARNING CALLBACK HELL
        card.container.on('pointertap', () => {
            if (!this.lastSelectedCard) {
                this.lastSelectedCard = true;
                this.lastSelectedCardArray.push(card.container);
                this.deckLayer.removeChild(card.container);
                this.overLayer.addChild(card.container);

                //Turn off eventListeners turned on by last selected card
                slotPositions.forEach(slot => {
                    slot.interactive = false;
                    slot.off('pointertap');
                })

                //Turn on eventListeners 
                slotPositions.forEach(slot => {
                    if (slot !== slotPositions[1]) {
                        slot.interactive = true;

                        slot.on('pointertap', () => {
                            gsap.to(card.container, {
                                pixi: { x: slot.x, y: slot.y }, duration: 0.4,
                            });

                            //Turn off eventListeners 
                            slotPositions.forEach(slot => {
                                slot.interactive = false;
                                slot.off('pointertap');
                            })

                            this.lastSelectedCard = false;
                            this.lastSelectedCardArray.pop();
                        });
                    }
                });

            } else {
                const selectedCard = this.lastSelectedCardArray[0];
                this.deckLayer.removeChild(card.container);
                this.overLayer.addChild(card.container);

                gsap.to(selectedCard, {
                    pixi: { x: card.container.x, y: card.container.y + 40 }, duration: 0.4, onComplete: () => {
                        //this.showLastCard(selectedCard);
                        this.lastSelectedCard = false;
                        this.lastSelectedCardArray.pop();

                    }
                })
                this.overLayer.removeChild(card.container)
                this.deckLayer.addChild(card.container);
            }
        });
    }

    private showLastCard(card: PIXI.Container) {
        for (let pile of pilesContainer) {
            for (let c of pile) {
                if (c.container.x == card.x && c.container.y == card.y) {
                    const cardIndex = pile.indexOf(c);
                    pile.splice(cardIndex, 1);
                    console.log(pile.length);
                    if (pile.length > 0) {
                        this.flipToFront(pile[cardIndex - 1]);
                    }
                }
            }
        };
    }

    public async generateCards() {
        const suits = ["clubs", "hearts", "spades", "diamonds"];
        const texture = await this.loadTextures();

        let xClubsStartpoint = 50;
        let yClubsStartpoint = 848;

        for (let i = 0; i < 52; i++) {

            let number = (i + 1) % 13 == 0 ? 13 : (i + 1) % 13;
            const suit = suits[Math.floor(i / 13)];
            const card = new Card(number, suit);
            card.backSprite = new PIXI.Sprite(texture[1]);
            card.container.interactive = true;
            card.container.pivot.x = card.container.width / 2;
            card.container.pivot.y = card.container.height / 2;
            card.sprite = new PIXI.Sprite(new PIXI.Texture(texture[0].baseTexture,
                new PIXI.Rectangle(xClubsStartpoint, yClubsStartpoint, CARD_WIDTH, CARD_HEIGHT)));

            // calibrating
            this.calibratingCard(card, texture);
            //generate Mask
            const cardMask = card.generateMask(card.sprite.x, card.sprite.y);

            this.deck.push(card);
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
        // //suffeling the Deck
        // this.shuffleDeck();
        // //rendering Cards
        // this.renderCards()
        // //Moving deck cards to SlotPosition 1
        //this.showTopCardFromDeck();

    }

    public setState(state: any) {
        this.state = state;
        this.app.stage.addChild(this.deckLayer, this.overLayer);
        this.renderCards();
        gameInfo

    }

    public setMoves(moves: any) {
        this.moves = moves;
        //send('moves',state{
        //action: "flip","take","place",
        //index: 22,
        //source: "stock", "pile","waste","foundation", iztochnik ot koito iskame da oburnem
        //target:  za place dvijenieto, ,source- ot kudeto da vzemem, target- kudeto da postavim
        //});
    }

    private showTopCardFromDeck() {

        for (let i = this.deck.length - 1; i >= 0; i--) {
            let top = this.deck[i];

            if (top.container.x == slotPositions[0].x && top.container.y == slotPositions[0].y) {
                top.container.interactive = true;
                top.container.on('pointertap', () => {
                    this.moveTopCardToSlot1(top, i);
                });
            }
        }
    }

    private moveTopCardToSlot1(topCard: Card, index: number) {
        if (this.deck.length > 27) {
            this.app.stage.addChild(topCard.container);
            gsap.to(topCard.container, {
                pixi: { x: slotPositions[1].x, y: slotPositions[1].y }, duration: 0.1, onComplete: () => {
                    this.flipToFront(topCard);
                    console.log(`${topCard.suit} -> ${topCard.rank}`);
                    this.deck.splice(index, 1);

                    this.slotOneCards.unshift(topCard);

                    slotPositions[0].on('pointertap', this.moveAllCardsToDeck.bind(this));
                }
            });
        };
    };

    private moveAllCardsToDeck() {
        this.slotOneCards.forEach(c => {
            this.app.stage.addChild(c.container);
            gsap.to(c.container, {
                pixi: { x: slotPositions[0].x, y: slotPositions[0].y }, duration: 0.1, onComplete: () => {
                    this.flipToBack(c);
                    this.deck.push(c);
                    console.log(`${c} -> ${c.rank}`);
                }
            });
        });
        this.slotOneCards = [];
    }

    private renderCards() {
        const pilesArray = this.state.piles;
        const xStart = 116;
        const yStart = 410;
        const columnSpacing = this.deck[0].sprite.width + 90;
        const rowSpacing = 40;

        //put cards into slotPosition[7]  to slotPosition[13];
        for (let i = 7; i <= 13; i++) {
            //let pile: Card[] = [];
            const index = i - 7;
            for (let j = 0; j < pilesArray[index].cards.length; j++) {
                const card = pilesArray[index].cards[j];

                const realCard = this.deck.find(c => c.suit === card.suit && c.rank === card.face);

                if (card.faceUp === true) {
                    this.flipToFront(realCard);
                }
                realCard.container.x = xStart + (i - 7) * columnSpacing;
                realCard.container.y = yStart + j * rowSpacing;

                this.deckLayer.addChild(realCard.container);

                //pile.push(card);
            }
            //pilesContainer.push(pile);
        }

        for (let i = 0; i < this.state.stock.cards.length; i++) {
            const card = this.state.stock.cards[i];

            const realCard = this.deck.find(c => c.suit === card.suit && c.rank === card.face)
            realCard.container.x = slotPositions[0].x;
            realCard.container.y = slotPositions[0].y;
            this.deckLayer.addChild(realCard.container);
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

    private calibratingCard(card: Card, texture: PIXI.Texture[]) {
        card.backSprite = new PIXI.Sprite(texture[1]);
        card.container.interactive = true;
        card.container.pivot.x = card.container.width / 2;
        card.container.pivot.y = card.container.height / 2;

        card.backSprite.scale.x = 0.14;
        card.backSprite.scale.y = 0.146;
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