import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin";
import { slotPositions } from './utility';

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export class Card {
    private width: 415;
    private height: 630;
    public container: PIXI.Container;
    public sprite: PIXI.Sprite;
    public backSprite: PIXI.Sprite;
    public rank: number;
    public suit: string;
    public fliped: boolean = false;


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

    public flip() {
        this.container.on('pointertap', () => {
            if (this.fliped === false) {
                gsap.to(this.backSprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 });
                gsap.fromTo(this.sprite, { pixi: { scaleX: 0, skewY: 20 }, duration: 0.1 }, { pixi: { scaleX: 0.4, skewY: 0 }, duration: 0.1, delay: 0.1 });
                this.fliped = true
            }
        });
    }

    public moveTo() {
        // this.container.on('pointertap', () => {
        //     slotPositions.forEach(element => {
        //         element.interactive = true;
        //         element.on('pointertap', () => {
        //             gsap.to(this.container, { pixi: { x: element.x, y: element.y }, duration: 2 });
        //         });
        //     });

        // });
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