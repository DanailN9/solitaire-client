import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin";
import { pilesContainer, slotPositions } from './utility';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

let lastSelectedCard = false;
let lastSelectedCardArray: PIXI.Container[] = [];

export class Card {
    private width: 415;
    private height: 630;
    public container: PIXI.Container;
    public sprite: PIXI.Sprite;
    public backSprite: PIXI.Sprite;
    public rank: number;
    public suit: string;
    public fliped: boolean = false;
    public clicked: boolean = false;


    constructor(rank: number, suit: string) {
        this.suit = suit;
        this.rank = rank;
        this.sprite = new PIXI.Sprite();
        this.backSprite = new PIXI.Sprite();
        this.sprite.width = this.width;
        this.sprite.height = this.height;
        this.container = new PIXI.Container();
    }


    public getSprite(): PIXI.Sprite {
        return this.sprite;
    }

    public getBackSprite(): PIXI.Sprite {
        return this.backSprite;
    }

    public backflip() {
        this.container.on('pointertap', () => {
            this.flipToFront();
        });
    }

    public flipToFront() {
        if (this.fliped === false) {
            gsap.to(this.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(this.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.4, skewY: 0 }, duration: 0.1, delay: 0.1 });
            this.fliped = true;
            this.moveTo();
        }
    }

    public flipToBack() {
        if (this.fliped === true) {
            gsap.to(this.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
            gsap.fromTo(this.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.14, skewY: 0 }, duration: 0.1, delay: 0.1 });
            this.fliped = false;
        }
    }

    public moveTo() {
        //WARNING CALLBACK HELL
        this.container.on('pointertap', () => {
            if (!lastSelectedCard) {
                lastSelectedCard = true;
                lastSelectedCardArray.push(this.container);

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
                            gsap.to(this.container, {
                                pixi: { x: slot.x, y: slot.y }, duration: 0.4,
                            });

                            //Turn off eventListeners 
                            slotPositions.forEach(slot => {
                                slot.interactive = false;
                                slot.off('pointertap');
                            })

                            lastSelectedCard = false;
                            lastSelectedCardArray.pop();
                        });
                    }
                });

            } else {
                const selectedCard = lastSelectedCardArray[0];

                gsap.to(selectedCard, {
                    pixi: { x: this.container.x, y: this.container.y + 40 }, duration: 0.4, onComplete: () => {
                        //this.showLastCard(selectedCard);
                        lastSelectedCard = false;
                        lastSelectedCardArray.pop();
                    }
                })
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
                        pile[cardIndex - 1].flipToFront();
                    }
                }
            }
        };
    }

    public deal() {

    }

    public generateMask(x: number, y: number) {
        const mask = new PIXI.Graphics();
        mask.beginFill(0x000000);
        mask.drawRoundedRect(-83, -126, 166, 256, 15);
        mask.endFill();
        mask.position.set(x, y);
        this.container.mask = mask;
        return mask;
    }
}