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
export const slotPositions: PIXI.Graphics[] = [];
export const flippedCardContainers: PIXI.Container[] = [];
export let pilesContainer: Card[][] = [];
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