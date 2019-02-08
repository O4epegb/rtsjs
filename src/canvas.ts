export const canvas = document.createElement('canvas');
export const canvasContext = canvas.getContext('2d');

document.body.appendChild(canvas);

export const canvasWidth = 800;
export const canvasHeight = 600;

canvas.width = canvasWidth;
canvas.height = canvasHeight;

export function randomCanvasPoint() {
    return {
        x: Math.random() * (canvasWidth / 4),
        y: Math.random() * (canvasHeight / 4)
    };
}
