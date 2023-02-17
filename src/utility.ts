import * as PIXI from "pixi.js";
import { Card } from "./Card";
import { gsap } from 'gsap';
import { PixiPlugin } from "gsap/PixiPlugin";

gsap.registerPlugin(PixiPlugin);
PixiPlugin.registerPIXI(PIXI);

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
export const stockArr:Card[] = [];
export const wasteArr:Card[] = [];

export let i = 0;
export type DeckType = 'stock' | 'pile0' | 'pile1' | 'pile2' | 'pile3' | 'pile4' | 'pile5' | 'pile6' | 'clubs' | 'diamonds' | 'hearts' | 'spades' | null | `pile${typeof i}` | 'waste';

export function findTarget(i: number) {
    let targetPlace: DeckType;
    if (i == 1) {
        targetPlace = 'waste';
    } else if (i == 2) {
        targetPlace = 'clubs'
    } else if (i == 3) {
        targetPlace = 'diamonds'
    } else if (i == 4) {
        targetPlace = 'hearts'
    } else if (i == 5) {
        targetPlace = 'spades'
    } else if (i == 6) {
        targetPlace = 'pile0'
    } else if (i == 7) {
        targetPlace = 'pile1'
    } else if (i == 8) {
        targetPlace = 'pile2'
    } else if (i == 9) {
        targetPlace = 'pile3'
    } else if (i == 10) {
        targetPlace = 'pile4'
    } else if (i == 11) {
        targetPlace = 'pile5'
    } else if (i == 12) {
        targetPlace = 'pile6'
    }
    return targetPlace;
}

export function checkFoundations(targetPlace: DeckType, selectedCard: Card, foundationIndexes: object[]) {
    if (targetPlace === 'clubs') {
        const num: number = foundationIndexes[0]['clubsIndex']
        selectedCard.indx = num;
        foundationIndexes[0]['clubsIndex']++;

    } else if (targetPlace === 'diamonds') {
        const num: number = foundationIndexes[1]['diamondsIndex']
        selectedCard.indx = num;
        foundationIndexes[1]['diamondsIndex']++;

    } else if (targetPlace === 'hearts') {
        const num: number = foundationIndexes[2]['heartsIndex']
        selectedCard.indx = num;
        foundationIndexes[2]['heartsIndex']++;

    } else if (targetPlace === 'spades') {
        const num: number = foundationIndexes[3]['spadesIndex']
        selectedCard.indx = num;
        foundationIndexes[3]['spadesIndex']++;
    }
}

export function moveToSlotAnimation(selectedCard: Card, slotX: number, slotY: number) {
    gsap.to(selectedCard.container, {
        pixi: { x: slotX, y: slotY }, duration: 0.4,
    });
}

export function moveCardToCardAnimation(selectedCard: Card, secondCard: Card, distance: number) {
    gsap.to(selectedCard.container, {
        pixi: { x: secondCard.container.x, y: secondCard.container.y + distance }, duration: 0.4, onComplete: () => {
        }
    })
}
