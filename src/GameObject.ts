import * as PIXI from 'pixi.js';
import { Card } from './Card';
import { APP_HEIGHT, APP_WIDTH, ASSET_HEIGHT, ASSET_WIDTH, BACKSPRITE_SCALE_X, BACKSPRITE_SCALE_Y, CARD_HEIGHT, CARD_WIDTH, checkFoundations, COL_LENGTH, DeckType, findTarget, FRONTSPRITE_SCALE_X, FRONTSPRITE_SCALE_Y, moveCardToCardAnimation, moveToSlotAnimation, ROW_LENGTH, slotPositions, stockArr, wasteArr } from './utility';
import { gsap } from 'gsap';
import { Connection } from './Connection';

const gameSection = document.getElementById('game');
let created: boolean = false;


type GameMove = {
    action: 'flip' | 'take' | 'place',
    index: number,
    source: DeckType,
    target: DeckType
};

export class GameObject {
    private app: PIXI.Application;
    private deck: Card[] = [];
    private state: any;
    private moves: any;
    private lastSelectedCard: boolean = false;
    private lastSelectedCardArray: Card[] = [];
    private deckLayer: PIXI.Container;
    private overLayer: PIXI.Container;
    private expectedMove: GameMove;
    private data: any;
    private lastPositionX: number = 0;
    private lastPositionY: number = 0;
    private backSrc: DeckType;
    private backIndx: number = 0;
    private targetPlace: DeckType;
    private wasteIndex: number = 0;
    private foundationIndexes: object[] = [{ clubsIndex: 0 }, { diamondsIndex: 0 }, { heartsIndex: 0 }, { spadesIndex: 0 }];
    private slotX: number = 0;
    private slotY: number = 0;

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
                if (slotPositions.length == 1) {
                    slotPositions[0].interactive = true;
                    slotPositions[0].on('pointertap', this.moveAllCardsToDeck.bind(this));
                }
            }
            yStartPosition += 270;
            xStartPosition = 113;
        }
    }

    public generateAllMask() {
        this.deck.forEach((c) => {
            const m = c.generateMask(32, 280);
            c.container.mask = m;
        })
    }

    private flipToFront(card: Card) {
        if (card.fliped === false) {
            gsap.to(card.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(card.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.4, skewY: 0 }, duration: 0.1, delay: 0.1 });
            card.fliped = true;
        }
    }

    private flipToBack(card: Card) {
        if (card.fliped === true) {
            gsap.to(card.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(card.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.14, skewY: 0 }, duration: 0.1, delay: 0.1 });
            card.fliped = false;
        }
    }

    private topCardToWaste(topCard: Card) {
        topCard.container.interactive = true;
        gsap.to(topCard.container, {
            pixi: { x: slotPositions[1].x, y: slotPositions[1].y }, onComplete: () => {
                this.flipToFront(topCard);
            }
        });
    }

    private moveAllCardsToDeck() {
        this.sendMove({
            action: 'flip',
            source: 'stock',
            target: null,
            index: 0
        });

        wasteArr.forEach((c) => {
            this.overLayer.removeChild(c.container);
            this.deckLayer.addChild(c.container);
            gsap.to(c.container, {
                pixi: { x: slotPositions[0].x, y: slotPositions[0].y }, duration: 0.1, onComplete: () => {
                    this.flipToBack(c);
                    stockArr.push(c);
                    this.wasteIndex--;
                }
            });
        });
        wasteArr.splice(0, wasteArr.length);
    }

    private activateEventListener(card: Card) {
        card.container.on('pointertap', () => {
            if (card.fliped == false) {
                this.sendMove({
                    action: 'flip',
                    source: 'stock',
                    target: null,
                    index: card.indx
                })
                return;
            }

            if (!this.lastSelectedCard) {
                this.lastSelectedCard = true;
                this.lastSelectedCardArray.push(card);

                //Turn off eventListeners turned on by last selected searchedCard
                for (let i = 1; i < slotPositions.length; i++) {
                    slotPositions[i].interactive = false;
                    slotPositions[i].off('pointertap');
                }

                console.log('Taking', card.src)

                this.sendMove({
                    action: 'take',
                    index: card.indx,
                    source: card.src,
                    target: null
                });
            } else {
                this.lastSelectedCardArray.push(card)
                const selectedCard = this.lastSelectedCardArray[0];
                this.sendMove({
                    action: 'place',
                    source: selectedCard.src,
                    target: card.target,
                    index: selectedCard.indx
                });
                this.lastSelectedCard = false;
            }
        });
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
            throw new Error('DATA IS NULL');
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
                searchedCard.src = 'stock';
                searchedCard.indx = this.wasteIndex;
                this.wasteIndex++;
                this.lastSelectedCard = false;
                wasteArr.push(searchedCard);
                this.topCardToWaste(searchedCard);

            } else if (this.expectedMove.source.includes('pile')) {
                this.deckLayer.addChild(searchedCard.container);
                searchedCard.indx = this.backIndx;
                searchedCard.src = this.backSrc;
                searchedCard.target = this.backSrc;
                searchedCard.container.x = this.lastPositionX;
                searchedCard.container.y = this.lastPositionY;
                this.flipToFront(searchedCard);
            }
        } else if (this.expectedMove.action === 'take') {
            const searchedCard = this.lastSelectedCardArray[0]

            //Turn on eventListeners 
            for (let i = 1; i < slotPositions.length; i++) {
                const slot = slotPositions[i];
                slot.interactive = true;

                slot.on('pointertap', () => {
                    //finding slot type 
                    this.targetPlace = findTarget(i);

                    this.slotX = slot.x;
                    this.slotY = slot.y;
                    // console.log('SLOT0', this.targetPlace)

                    this.sendMove({
                        action: 'place',
                        source: searchedCard.src,
                        target: this.targetPlace,
                        index: searchedCard.indx
                    })
                });
            };
        } else if (this.expectedMove.action = 'place') {
            if (data === true) {
                if (this.lastSelectedCardArray.length === 1) {

                    const selectedCard = this.lastSelectedCardArray[0];

                    if (selectedCard.src == 'stock') {
                        console.log('bbbbbbbbbbbbbbbbbbbbbbbb');
                        wasteArr.splice(selectedCard.indx, 1);
                    }
                    this.deckLayer.removeChild(selectedCard.container);
                    this.overLayer.addChild(selectedCard.container);

                    if (selectedCard.src === 'clubs') {
                        this.foundationIndexes[0]['clubsIndex']--
                    } else if (selectedCard.src === 'diamonds') {
                        this.foundationIndexes[1]['diamondsindex']--
                    } else if (selectedCard.src === 'hearts') {
                        this.foundationIndexes[2]['heartsIndex']--
                    } else if (selectedCard.src === 'spades') {
                        this.foundationIndexes[3]['spadesIndex']--
                    }

                    selectedCard.src = this.targetPlace;
                    selectedCard.target = this.targetPlace;

                    //Check foundation indexes exported from utility 
                    checkFoundations(this.targetPlace, selectedCard, this.foundationIndexes)

                    //if the card is located on the waste, and moved from there, decrement the waste index 
                    if (selectedCard.container.x === slotPositions[1].x && selectedCard.container.y === slotPositions[1].y) {
                        this.wasteIndex--
                    }

                    //Move to slot animation
                    moveToSlotAnimation(selectedCard, this.slotX, this.slotY);

                    //Turn off eventListeners 
                    for (let i = 1; i < slotPositions.length; i++) {
                        slotPositions[i].interactive = false;
                        slotPositions[i].off('pointertap');

                    }
                    this.overLayer.removeChild(selectedCard.container);
                    this.deckLayer.addChild(selectedCard.container);

                    this.lastSelectedCard = false;
                    this.lastSelectedCardArray.pop();

                } else {
                    //TARGET CARD
                    const secondCard = this.lastSelectedCardArray.pop();
                    //SELECTED CARD
                    const selectedCard = this.lastSelectedCardArray.pop();

                    this.deckLayer.removeChild(selectedCard.container);
                    this.overLayer.addChild(selectedCard.container);

                    if (selectedCard.src == 'stock') {
                        wasteArr.splice(selectedCard.indx, 1);
                    }

                    selectedCard.target = secondCard.target;
                    selectedCard.indx = secondCard.indx + 1;
                    selectedCard.src = secondCard.src;
                    console.log(secondCard.src)

                    //if the card is located on the waste, and moved from there, decrement the waste index 
                    if (selectedCard.container.x === slotPositions[1].x && selectedCard.container.y === slotPositions[1].y) {
                        this.wasteIndex--
                    }
                    //movingCards animation
                    if (selectedCard.target === 'clubs' ||
                        selectedCard.target === 'diamonds' ||
                        selectedCard.target === 'hearts' ||
                        selectedCard.target === 'spades') {
                        moveCardToCardAnimation(selectedCard, secondCard, 0)
                    } else {
                        moveCardToCardAnimation(selectedCard, secondCard, 40)
                    }

                    this.overLayer.removeChild(selectedCard.container);
                    this.deckLayer.addChild(selectedCard.container);

                    this.lastSelectedCardArray.splice(0, this.lastSelectedCardArray.length - 1)
                }
            } else {
                this.lastSelectedCard = false;
                this.lastSelectedCardArray.splice(0, this.lastSelectedCardArray.length)
                console.log(this.lastSelectedCardArray)
            }
        }
    }

    public Victory() {
        //TODO:
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
                    //Real Card (frontSpite, backSprite, mask), stored in this.deck;
                    card = this.deck.find(c => c.suit === receivedCard.suit && c.rank === receivedCard.face);

                } else {
                    const backSprite = new PIXI.Sprite(texture[1]);
                    //Card From (backSprite, mask) only
                    card = new Card(backSprite);
                    const cardMask = card.generateMask(card.backSprite.x, card.backSprite.y);
                    this.backSpriteSize(card);
                    card.container.addChild(card.backSprite, cardMask);
                }
                if (card.suit) {
                    this.flipToFront(card);
                }
                if (card.suit == null) {
                    card.container.interactive = true;
                    card.container.on('pointertap', () => {

                        this.lastPositionX = card.container.x;
                        this.lastPositionY = card.container.y;
                        this.backIndx = j;
                        this.backSrc = `pile${index}`
                        this.deckLayer.removeChild(card.container);
                        this.sendMove({
                            action: 'flip',
                            index: j,
                            source: `pile${index}`,
                            target: null
                        });
                    })
                } else {
                    card.target = `pile${i - 7}`;
                    card.indx = j;
                    card.src = `pile${i - 7}`;
                }
                card.container.x = xStart + (i - 7) * columnSpacing;
                card.container.y = yStart + j * rowSpacing;
                this.deckLayer.addChild(card.container);
            }
        }
        //put cards into slotPosition[0], Stock;
        for (let i = 0; i < stock.cards.length; i++) {
            const backSprite = new PIXI.Sprite(texture[1]);
            //Card From (backSprite, mask) only
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
                this.backIndx = i;
                this.sendMove({
                    action: 'flip',
                    index: i,
                    source: 'stock',
                    target: null
                });
                //card.container.off('pointertap');
            });
        }
    }

    private backSpriteSize(card: Card) {
        card.backSprite.scale.x = BACKSPRITE_SCALE_X;
        card.backSprite.scale.y = BACKSPRITE_SCALE_Y;
        card.backSprite.anchor.set(0.5, 0.5)
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