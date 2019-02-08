import { clamp } from 'lodash';
import {
    colorCircle,
    coloredOutlineRectCornerToCorner,
    findClosestUnitInRange,
    colorLine
} from './utils';
import { randomCanvasPoint, canvasWidth, canvasHeight } from './canvas';

const UNIT_SELECT_PADDING = 3;
const UNIT_RANKS_MARGIN = 3;
const UNIT_ATTACK_RANGE = 55;
const UNIT_AI_ATTACK_INITIATE = UNIT_ATTACK_RANGE + 10;
const UNIT_PLAYABLE_AREA_MARGIN = 20;

export class Unit {
    x = 0;
    y = 0;
    gotoX = 0;
    gotoY = 0;

    speed = 2;
    radius = 5;
    isDead = false;
    isPlayerControlled = false;
    color = 'white';
    myTarget: Unit = null;

    get selectPadding() {
        return this.radius + UNIT_SELECT_PADDING;
    }

    get spacingMargin() {
        return this.radius * UNIT_RANKS_MARGIN;
    }

    constructor(isPlayerControlled = true) {
        const { x, y } = randomCanvasPoint();

        this.x = x;
        this.y = y;
        this.isPlayerControlled = isPlayerControlled;

        if (!this.isPlayerControlled) {
            this.x = canvasWidth - this.x;
            this.y = canvasHeight - this.y;
            this.color = 'red';
        }

        this.gotoX = this.x;
        this.gotoY = this.y;
    }

    draw() {
        if (!this.isDead) {
            colorCircle(this.x, this.y, this.radius, this.color);
        } else {
            colorCircle(this.x, this.y, this.radius, 'yellow');
        }
    }

    drawSelectionBox = () => {
        coloredOutlineRectCornerToCorner(
            this.x - this.selectPadding,
            this.y - this.selectPadding,
            this.x + this.selectPadding,
            this.y + this.selectPadding,
            'yellow'
        );
    };

    drawTargetLine = () => {
        const color = this.isPlayerControlled ? 'green' : 'red';
        const deltaY = this.isPlayerControlled ? -1 : 1;

        colorLine(
            this.x,
            this.y + deltaY,
            this.myTarget.x,
            this.myTarget.y + deltaY,
            color
        );
    };

    act(playerUnits: Array<Unit>) {
        let someoneWasKilled = false;

        if (this.myTarget) {
            if (this.myTarget.isDead) {
                this.myTarget = null;
                this.gotoX = this.x;
                this.gotoY = this.y;
            } else if (
                this.distFrom(this.myTarget.x, this.myTarget.y) >
                UNIT_ATTACK_RANGE
            ) {
                this.gotoX = this.myTarget.x;
                this.gotoY = this.myTarget.y;
            } else {
                this.myTarget.isDead = true;
                this.gotoX = this.x;
                this.gotoY = this.y;

                someoneWasKilled = true;
            }
        } else if (this.isPlayerControlled === false) {
            if (Math.random() < 0.02) {
                const nearestOpponentFound = findClosestUnitInRange(
                    this.x,
                    this.y,
                    UNIT_AI_ATTACK_INITIATE,
                    playerUnits
                );
                if (nearestOpponentFound) {
                    this.myTarget = nearestOpponentFound;
                } else {
                    this.gotoX = this.x - Math.random() * 70;
                    this.gotoY = this.y - Math.random() * 70;
                }
            }
        }

        this.keepInPlayableArea();

        const deltaX = this.gotoX - this.x;
        const deltaY = this.gotoY - this.y;
        const moveAng = Math.atan2(deltaY, deltaX);
        const moveX = this.speed * Math.cos(moveAng);
        const moveY = this.speed * Math.sin(moveAng);
        const distToGo = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        if (distToGo > this.speed) {
            this.x += moveX;
            this.y += moveY;
        } else {
            this.x = this.gotoX;
            this.y = this.gotoY;
        }

        return someoneWasKilled;
    }

    keepInPlayableArea = () => {
        this.gotoX = clamp(
            this.gotoX,
            UNIT_PLAYABLE_AREA_MARGIN,
            canvasWidth - UNIT_PLAYABLE_AREA_MARGIN
        );
        this.gotoY = clamp(
            this.gotoY,
            UNIT_PLAYABLE_AREA_MARGIN,
            canvasHeight - UNIT_PLAYABLE_AREA_MARGIN
        );
    };

    setGoto(gotoX: number, gotoY: number) {
        this.gotoX = gotoX;
        this.gotoY = gotoY;
    }

    setTarget(target: Unit) {
        this.myTarget = target;
    }

    gotoNear = (
        aroundX: number,
        aroundY: number,
        formationIndex: number,
        formationSize: number
    ) => {
        const colNum = formationIndex % formationSize;
        const rowNum = Math.floor(formationIndex / formationSize);

        this.setGoto(
            aroundX + colNum * this.spacingMargin,
            aroundY + rowNum * this.spacingMargin
        );
    };

    isInBox = (x1: number, y1: number, x2: number, y2: number) => {
        return (
            (this.x - x1) * (this.x - x2) < 0 &&
            (this.y - y1) * (this.y - y2) < 0
        );
    };

    distFrom = (otherX: number, otherY: number) => {
        const deltaX = otherX - this.x;
        const deltaY = otherY - this.y;
        return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    };
}
