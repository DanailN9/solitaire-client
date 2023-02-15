import * as PIXI from "pixi.js";
import { Card } from "./Card";

//Constants
export const ROW_LENGTH = 2;
export const COL_LENGTH = 7;
export const CARD_WIDTH = 415;
export const CARD_HEIGHT = 630;
export const APP_WIDTH = 1770;
export const APP_HEIGHT = 840;
export const ASSET_WIDTH = 6000;
export const ASSET_HEIGHT = 4000;
export const FRONTSPRITE_SCALE_X = 0.4;
export const FRONTSPRITE_SCALE_Y = 0.4;
export const BACKSPRITE_SCALE_X = 0.14;
export const BACKSPRITE_SCALE_Y = 0.146;
export const slotPositions: PIXI.Graphics[] = [];
export const flippedCardContainers: PIXI.Container[] = [];
export let pilesContainer: Card[][] = [];
export let i = 0;
export type CardTarget = 'pile0' | 'pile1' | 'pile2' | 'pile3' | 'pile4' | 'pile5' | 'pile6' | 'clubs' | 'diamonds' | 'hearts' | 'spades'| `pile${typeof i}`;
export type DeckType = 'stock' | 'pile0' | 'pile1' | 'pile2' | 'pile3' | 'pile4' | 'pile5' | 'pile6' | 'clubs' | 'diamonds' | 'hearts' | 'spades' | null | `pile${typeof i}` | 'waste';


export function findTarget(i: number) {
    let targetPlace: DeckType;
    if (i == 0) {
        targetPlace = 'stock';
    } else if (i == 1) {
        targetPlace = 'waste';
    } else if (i == 2) {
        targetPlace = 'clubs'
    } else if (i == 3) {
        targetPlace = 'diamonds'
    } else if (i == 4) {
        targetPlace = 'hearts'
    } else if (i == 5) {
        targetPlace = 'spades'
    } else if (i == 7) {
        targetPlace = 'pile0'
    } else if (i == 8) {
        targetPlace = 'pile1'
    } else if (i == 9) {
        targetPlace = 'pile2'
    } else if (i == 10) {
        targetPlace = 'pile3'
    } else if (i == 11) {
        targetPlace = 'pile4'
    } else if (i == 12) {
        targetPlace = 'pile5'
    } else if (i == 13) {
        targetPlace = 'pile6'
    }
    return targetPlace;
}

export const gameInfo = {
    foundations: {
        clubs: {
            cards: [],
            suit: 'clubs',
            type: 'foundation'
        },
        diamonds: {
            cards: [],
            suit: 'diamonds',
            type: 'foundation'

        },
        hearts: {
            cards: [],
            suit: 'hearts',
            type: 'foundation'

        },
        spades: {
            cards: [],
            suit: 'spades',
            type: 'foundation'
        }
    },
    piles: [
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
        {
            //face: 11, suit: 'diamonds', faceUp: true
            cards: [{}],
            type: null,
            suit: 'pile'
        },
    ],
    stock: {
        cards: [{ face: 11, suit: 'spades', faceUp: false }], // x 24
        suit: null,
        type: 'stock'
    },
    waste: {
        cards: [{}],
        suit: null,
        type: 'waste'
    }
}