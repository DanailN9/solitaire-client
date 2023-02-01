import * as PIXI from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

export class Card {
    private width: 415;
    private height: 630;
    public sprite: PIXI.Sprite;
    public rank: number;
    public suit: string;


    constructor(rank: number, suit: string) {
        this.suit = suit;
        this.rank = rank;
        this.sprite = new PIXI.Sprite();
        this.sprite.width = this.width;
        this.sprite.height = this.height;
    }


    public getSprite(): PIXI.Sprite {
        return this.sprite;
    }

    public flip() {

    }

    public moveTo() {

    }

    public deal() {

    }
}