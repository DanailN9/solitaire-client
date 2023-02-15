import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, BACKSPRITE_SCALE_X, BACKSPRITE_SCALE_Y, CardTarget, CARD_HEIGHT, CARD_WIDTH, COL_LENGTH, DeckType, findTarget, FRONTSPRITE_SCALE_X, FRONTSPRITE_SCALE_Y, gameInfo, pilesContainer, ROW_LENGTH, slotPositions } from './utility';
import { gsap } from 'gsap';
import { Connection } from './Connection';

const gameSection = document.getElementById('game');
let created: boolean = false;


type GameMove = {
    action: 'flip' | 'take' | 'place',
    index: number,
    source: DeckType,
    target: DeckType | CardTarget
}

export class GameObject {
    private app: PIXI.Application;
    private deck: Card[] = [];
    private slotOneCards: Card[] = [];
    private state: any;
    private moves: any;
    public lastSelectedCard = false;
    public lastSelectedCardArray: Card[] = [];
    private deckLayer: PIXI.Container;
    private overLayer: PIXI.Container;
    private expectedMove: GameMove;
    private data: any;
    private lastPositionX: number = 0;
    private lastPositionY: number = 0;
    private src: DeckType;
    private indx: number = 0;
    private targetPlace: DeckType

    constructor(public connection: Connection) {
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
                    xStartPosition += 256;
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
        }
    }

    public flipToBack(card: Card) {
        if (card.fliped === true) {
            gsap.to(card.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(card.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.14, skewY: 0 }, duration: 0.1, delay: 0.1 });
            card.fliped = false;
        }
    }

    public activateEventListener(card: Card) {
        //WARNING CALLBACK HELL
        card.container.on('pointertap', () => {
            if (card.fliped == false) {
                return;
            }

            if (!this.lastSelectedCard) {
                this.lastSelectedCard = true;
                this.lastSelectedCardArray.push(card);
                this.sendMove({
                    action: 'take',
                    index: card.indx,
                    source: card.src,
                    target: null
                });
                this.deckLayer.removeChild(card.container);
                this.overLayer.addChild(card.container);

                //Turn off eventListeners turned on by last selected card
                slotPositions.forEach(slot => {
                    slot.interactive = false;
                    slot.off('pointertap');
                })

                //Turn on eventListeners 
                for (let i = 0; i < slotPositions.length; i++) {
                    const slot = slotPositions[i];
                    slot.interactive = true;

                    slot.on('pointertap', () => {

                        this.targetPlace = findTarget(i);

                        this.sendMove({
                            action: 'place',
                            source: card.src,
                            target: this.targetPlace,
                            index: card.indx
                        })
                        if (this.data == true) {
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
                        }
                    });

                };

            } else {
                console.log(card.target)
                const selectedCard = this.lastSelectedCardArray[0];
                this.sendMove({
                    action: 'place',
                    source: selectedCard.src,
                    target: card.target,
                    index: card.indx
                });

                if (this.data == true) {
                   
                    selectedCard.target = card.target;
                    selectedCard.indx = card.indx + 1;
                    selectedCard.src = card.src;
                    this.deckLayer.removeChild(card.container);
                    this.overLayer.addChild(card.container);

                    gsap.to(selectedCard.container, {
                        pixi: { x: card.container.x, y: card.container.y + 40 }, duration: 0.4, onComplete: () => {
                            //this.showLastCard(selectedCard);
                            this.lastSelectedCard = false;
                            this.lastSelectedCardArray.pop();

                        }
                    })
                    this.overLayer.removeChild(card.container)
                    this.deckLayer.addChild(card.container);
                }
            }
            //-----------------

        });
    }
    //waiting for Refactor
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
            const card = new Card(null, number, suit);

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

            //for cutting correctly every single card
            xClubsStartpoint += 458;
            if (xClubsStartpoint >= ASSET_WIDTH - 300) {
                xClubsStartpoint = 42;
                yClubsStartpoint += 660;

                if (yClubsStartpoint >= ASSET_HEIGHT - 630) {
                    break;
                }
            }

            this.activateEventListener(card);
        }
    }

    public async setState(state: any) {
        this.state = state;
        this.app.stage.addChild(this.deckLayer, this.overLayer);
        await this.renderCards();
        //this.showTopCardFromDeck();
        //gameInfo
    }

    public sendMove(move: GameMove) {
        this.expectedMove = move;
        console.log(this.expectedMove)
        this.connection.send('move', move);
    }

    public receivedMoves(moves: any) {
        console.log('received moves', moves);
    }

    public setResult(data: any) {
        console.log(data);
        if (data == null) {
            console.log(`DATA IS NULL`)
        }

        if (typeof data == 'boolean') {
            this.data = data;
        }
        if (this.expectedMove.action == 'flip') {
            const searchedCard = this.deck.find(c => c.suit === data.suit && c.rank === data.face);

            if (this.expectedMove.source == 'stock') {
                this.deckLayer.addChild(searchedCard.container);
                searchedCard.container.x = slotPositions[0].x;
                searchedCard.container.y = slotPositions[0].y;
                this.topCardToWaste(searchedCard);
            } else if (this.expectedMove.source.includes('pile')) {
                this.deckLayer.addChild(searchedCard.container);
                searchedCard.container.x = this.lastPositionX;
                searchedCard.container.y = this.lastPositionY;
                this.flipToFront(searchedCard);
            }
        } else if (this.expectedMove.action = 'take') {


        } else if (this.expectedMove.action = 'place') {
            if (this.expectedMove.source) {

            }
        }
    }

    public Victory() {

    }

    private topCardToWaste(topCard: Card) {
        topCard.container.interactive = true;
        gsap.to(topCard.container, {
            pixi: { x: slotPositions[1].x, y: slotPositions[1].y }, onComplete: () => {
                this.flipToFront(topCard);
            }
        });
    }
    //waiting for Refactor
    private moveTopCardToSlot1(topCard: Card, index: number) {
        if (this.state.stock.cards.length > 27) {
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
    //waiting for Refactor
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

    private async renderCards() {

        const texture = await this.loadTextures();

        const xStart = 116;
        const yStart = 410;
        const columnSpacing = this.deck[0].sprite.width + 90;
        const rowSpacing = 40;

        const piles = this.state.piles;
        const foundations = this.state.foundations; //empty at start
        const stock = this.state.stock;
        const waste = this.state.waste; //empty at start

        //put cards into slotPosition[7]  to slotPosition[13], Piles;
        for (let i = 7; i <= 13; i++) {
            const index = i - 7;
            for (let j = 0; j < piles[index].cards.length; j++) {

                const receivedCard = piles[index].cards[j];
                let card: Card;

                if (receivedCard.faceUp == true && receivedCard.suit != null && receivedCard.face != null) {
                    card = this.deck.find(c => c.suit === receivedCard.suit && c.rank === receivedCard.face);

                } else {
                    const backSprite = new PIXI.Sprite(texture[1]);
                    card = new Card(backSprite);
                    const cardMask = card.generateMask(card.backSprite.x, card.backSprite.y);
                    this.backSpriteSize(card);
                    card.container.addChild(card.backSprite, cardMask);
                }
                if (card.suit) {
                    this.flipToFront(card);
                }
                if (card.suit == null) {
                    card.container.on('pointertap', () => {

                        this.lastPositionX = card.container.x;
                        this.lastPositionY = card.container.y;
                        this.deckLayer.removeChild(card.container);
                        this.sendMove({
                            action: 'flip',
                            index: j,
                            source: `pile${index}`,
                            target: null
                        });
                    })
                } else {
                    //console.log(card.target);
                    card.target = `pile${i - 7}`;
                    card.indx = j;
                    card.src = `pile${i - 7}`;
                }
                card.container.interactive = true;
                card.container.x = xStart + (i - 7) * columnSpacing;
                card.container.y = yStart + j * rowSpacing;
                this.deckLayer.addChild(card.container);
            }
        }
        //put cards into slotPosition[0], Stock;
        for (let i = 0; i < stock.cards.length; i++) {
            const backSprite = new PIXI.Sprite(texture[1]);

            const card = new Card(backSprite);
            const cardMask = card.generateMask(card.backSprite.x, card.backSprite.y);

            this.backSpriteSize(card);
            card.container.addChild(card.backSprite, cardMask);

            card.container.interactive = true;
            card.container.x = slotPositions[0].x;
            card.container.y = slotPositions[0].y;

            this.deckLayer.addChild(card.container);
            card.container.on('pointertap', () => {
                this.deckLayer.removeChild(card.container);
                //sending moves to server maybe...
                this.sendMove({
                    action: 'flip',
                    index: stock.cards.length - 1,
                    source: 'stock',
                    target: null
                });
            });
        }
    }

    private backSpriteSize(card: Card) {
        card.backSprite.scale.x = BACKSPRITE_SCALE_X;
        card.backSprite.scale.y = BACKSPRITE_SCALE_Y;
        card.backSprite.anchor.set(0.5, 0.5)
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

        this.backSpriteSize(card);

        card.sprite.scale.x = FRONTSPRITE_SCALE_X;
        card.sprite.scale.y = FRONTSPRITE_SCALE_Y;
        card.sprite.anchor.set(0.5, 0.5);

        card.sprite.x = card.sprite.x - card.container.x;
        card.sprite.y = card.sprite.y - card.container.y;
        card.backSprite.x = card.sprite.x - card.container.x;
        card.backSprite.y = card.sprite.y - card.container.y;
    }
}