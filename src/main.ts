import { range, remove } from 'lodash';
import { canvas } from './canvas';
import {
    colorRect,
    coloredOutlineRectCornerToCorner,
    findClosestUnitInRange
} from './utils';
import { Unit } from './Unit';

const framesPerSecond = 60;

let lassoX1 = 0;
let lassoY1 = 0;
let lassoX2 = 0;
let lassoY2 = 0;
let isMouseDragging = false;

function calculateMousePos(event) {
    const rect = canvas.getBoundingClientRect();
    const root = document.documentElement;

    const mouseX = event.clientX - rect.left - root.scrollLeft;
    const mouseY = event.clientY - rect.top - root.scrollTop;

    return {
        x: mouseX,
        y: mouseY
    };
}

const units = range(20).map(() => {
    const unit = new Unit();
    return unit;
});
const enemyUnits = range(20).map(() => {
    const unit = new Unit(false);
    return unit;
});
function getAllUnits() {
    return [...units, ...enemyUnits];
}

let selectedUnits: Array<Unit> = [];

function removeDeadUnits() {
    [units, enemyUnits, selectedUnits].forEach(list => {
        remove(list, unit => unit.isDead);
    });
}

function checkAndHandleVictory() {
    if (units.length === 0) {
        console.log('ENEMY TEAM WON');
    } else if (enemyUnits.length === 0) {
        console.log('PLAYER TEAM WON');
    }
}

function moveEverything() {
    const someoneWasKilled = getAllUnits().reduce((acc, unit) => {
        const killedSomeone = unit.act(units);

        return killedSomeone || acc;
    }, false);

    if (someoneWasKilled) {
        removeDeadUnits();
        checkAndHandleVictory();
    }
}

function drawEverything() {
    colorRect(0, 0, canvas.width, canvas.height, 'black');

    getAllUnits().forEach(unit => {
        unit.draw();

        if (unit.myTarget) {
            unit.drawTargetLine();
        }
    });
    selectedUnits.forEach(unit => unit.drawSelectionBox());

    if (isMouseDragging) {
        coloredOutlineRectCornerToCorner(
            lassoX1,
            lassoY1,
            lassoX2,
            lassoY2,
            'yellow'
        );
    }
}

const MIN_DIST_TO_COUNT_DRAG = 5;
function mouseMovedEnoughToTreatAsDrag() {
    const deltaX = lassoX1 - lassoX2;
    const deltaY = lassoY1 - lassoY2;
    const dragDist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    return dragDist > MIN_DIST_TO_COUNT_DRAG;
}

const MIN_DIST_FOR_MOUSE_CLICK_SELECTABLE = 12;
function getUnitUnderMouse(x: number, y: number) {
    return findClosestUnitInRange(
        x,
        y,
        MIN_DIST_FOR_MOUSE_CLICK_SELECTABLE,
        getAllUnits()
    );
}

function main() {
    setInterval(() => {
        moveEverything();
        drawEverything();
    }, 1000 / framesPerSecond);

    canvas.addEventListener('mousemove', event => {
        const mousePos = calculateMousePos(event);

        if (isMouseDragging) {
            lassoX2 = mousePos.x;
            lassoY2 = mousePos.y;
        }
    });

    canvas.addEventListener('mousedown', event => {
        const isLeftClick = event.button === 0;

        if (!isLeftClick) {
            return;
        }

        const mousePos = calculateMousePos(event);

        lassoX1 = mousePos.x;
        lassoY1 = mousePos.y;
        lassoX2 = lassoX1;
        lassoY2 = lassoY1;
        isMouseDragging = true;
    });

    canvas.addEventListener('mouseup', event => {
        const isLeftClick = event.button === 0;
        const isRightClick = event.button === 2;

        isMouseDragging = false;

        if (isLeftClick && mouseMovedEnoughToTreatAsDrag()) {
            selectedUnits = units.filter(unit =>
                unit.isInBox(lassoX1, lassoY1, lassoX2, lassoY2)
            );
            return;
        }

        const mousePos = calculateMousePos(event);
        const unitUnderMouse = getUnitUnderMouse(mousePos.x, mousePos.y);
        const isEnemyUnitClicked =
            unitUnderMouse && !unitUnderMouse.isPlayerControlled;
        const isPlayerUnitClicked =
            unitUnderMouse && unitUnderMouse.isPlayerControlled;

        if (isLeftClick) {
            selectedUnits = [];

            if (isPlayerUnitClicked) {
                selectedUnits = [unitUnderMouse];
            }
        } else if (isRightClick) {
            if (isEnemyUnitClicked) {
                selectedUnits.forEach(unit => {
                    unit.setTarget(unitUnderMouse);
                });
            } else {
                const formationSize = Math.floor(
                    Math.sqrt(selectedUnits.length + 2)
                );

                selectedUnits.forEach((unit, index) => {
                    unit.gotoNear(mousePos.x, mousePos.y, index, formationSize);
                });
            }
        }
    });

    canvas.addEventListener('contextmenu', event => {
        event.preventDefault();
    });
}

main();
