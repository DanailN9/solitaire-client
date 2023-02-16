import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin";
import { DeckType } from './utility';

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
    public clicked: boolean = false;
    public target: DeckType;
    public indx: number;
    public src: DeckType;

    constructor(backSprite?: PIXI.Sprite, rank?: number, suit?: string) {

        if (backSprite) {
            this.backSprite = backSprite;
            this.container = new PIXI.Container();
        } else {
            this.suit = suit;
            this.rank = rank;
            this.sprite = new PIXI.Sprite();
            this.backSprite = new PIXI.Sprite();
            this.sprite.width = this.width;
            this.sprite.height = this.height;
            this.container = new PIXI.Container();
        }
    }

    public getSprite(): PIXI.Sprite {
        return this.sprite;
    }

    public getBackSprite(): PIXI.Sprite {
        return this.backSprite;
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