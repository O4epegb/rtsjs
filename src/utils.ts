import { canvasContext } from './canvas';
import { Unit } from './Unit';

export function colorCircle(
    centerX: number,
    centerY: number,
    radius: number,
    fillColor: string
) {
    canvasContext.fillStyle = fillColor;
    canvasContext.beginPath();
    canvasContext.arc(centerX, centerY, radius, 0, Math.PI * 2, true);
    canvasContext.fill();
}

export function colorRect(
    topLeftX: number,
    topLeftY: number,
    boxWidth: number,
    boxHeight: number,
    fillColor: string
) {
    canvasContext.fillStyle = fillColor;
    canvasContext.fillRect(topLeftX, topLeftY, boxWidth, boxHeight);
}

export function coloredOutlineRectCornerToCorner(
    corner1X: number,
    corner1Y: number,
    corner2X: number,
    corner2Y: number,
    lineColor: string
) {
    canvasContext.strokeStyle = lineColor;
    canvasContext.beginPath();
    canvasContext.rect(
        corner1X,
        corner1Y,
        corner2X - corner1X,
        corner2Y - corner1Y
    );
    canvasContext.stroke();
}

export function colorLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    lineColor: string
) {
    canvasContext.strokeStyle = lineColor;
    canvasContext.beginPath();
    canvasContext.moveTo(x1, y1);
    canvasContext.lineTo(x2, y2);
    canvasContext.stroke();
}

export function findClosestUnitInRange(
    fromX: number,
    fromY: number,
    maxRange: number,
    unitList: Array<Unit>
) {
    let nearestUnitDist = maxRange;
    let nearestUnitFound: Unit | null = null;

    unitList.forEach(unit => {
        const distTo = unit.distFrom(fromX, fromY);

        if (distTo < nearestUnitDist) {
            nearestUnitDist = distTo;
            nearestUnitFound = unit;
        }
    });

    return nearestUnitFound;
}
