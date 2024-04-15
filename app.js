const canvas = document.getElementById('canvas');
const SCREEN_WIDTH = 1080;
const SCREEN_HEIGHT = 720;
const FOV = 90;
const RAY_SPEED = 0.01;
const RAY_SPEED_ACCURACY = 0.005;
const SENSITIVITY = 4;
const WALL_SCALE = SCREEN_HEIGHT/90;
const PLAYER_SPEED = 0.2;
const PIXEL_DENSITY = 1;

canvas.height = SCREEN_HEIGHT;
canvas.width = SCREEN_WIDTH;
canvas.style.background = "whitesmoke";
let context = canvas.getContext("2d");

const map = [
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", "R", " ", " ", " ", " ", " ", "#", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", "G", " ", " ", " ", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", "B", " ", " ", " ", "#"],
    ["#", " ", " ", " ", " ", " ", " ", " ", " ", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#", "#", "#"]
];

let playerX = 5.0;
let playerY = 5.0;
let playerDir = 0;

class Color {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = (alpha!==undefined)? alpha: 100;
        this.color = "rgba(" + this.red + ", " + this.green + ", " + this.blue + ", 100)";
    }
}

class Line {
    constructor(x, distance, tileType) {
        this.x = x;
        this.distance = distance;
        this.tileType = (tileType!==undefined)? tileType: "#";
    }
}

let lineList = [new Line(0,0)];
let orderedLineList = [new Line(-1,0), new Line(-1,0), new Line(-1,0)];



function addLineToRenderer(line) {
    let added = false;
    // for (let i = 0; i < orderedLineList.length; i++) {
    //     if (line.distance > orderedLineList[i].distance) {
    //         orderedLineList.splice(i, 0, line)
    //         added = true;
    //     }
    // }
    if (!added) {
        orderedLineList.push(line);
    }
}

function castRay(angle, x) {
    let rad = angle * Math.PI/180;
    let posX = playerX;
    let posY = playerY;

    // 0-90     + +
    // 90-180   - +
    // 180-270  - -
    // 270-360  + -
    let vectorX = Math.cos(rad);
    let vectorY = Math.sin(rad);

    let collision = false;
    while (!collision){
        posX += vectorX * RAY_SPEED;
        posY += vectorY * RAY_SPEED;
        if (map[Math.floor(posX)][Math.floor(posY)] !== " "
            || Math.floor(posX) === map[0].length
            || Math.floor(posX) === 0
            || Math.floor(posY) === map.length
            || Math.floor(posY) === 0){
            collision = true;
        }
    }
    let tileType = map[Math.floor(posX)][Math.floor(posY)];
    while (collision) {
        posX -= vectorX * RAY_SPEED_ACCURACY;
        posY -= vectorY * RAY_SPEED_ACCURACY;
        if (map[Math.floor(posX)][Math.floor(posY)] === " "
            && Math.floor(posX) !== map[0].length
            && Math.floor(posX) !== 0
            && Math.floor(posY) !== map.length
            && Math.floor(posY) !== 0){
            collision = false;
        }
    }
    let distance = Math.sqrt(Math.pow(playerX - posX, 2) + Math.pow(playerY - posY ,2));
    addLineToRenderer(new Line(x, distance, tileType));
}

function castRays(){
    orderedLineList = [new Line(-1,0)];
    for (let i = 0; i < SCREEN_WIDTH; i+=PIXEL_DENSITY){

        let angle = playerDir - FOV/2 + i*FOV/SCREEN_WIDTH;
        castRay(angle, i);
    }
}

function renderLinesOnCanvas() {
    for (let i = 0; i < orderedLineList.length; i++) {
        drawLine(orderedLineList[i],context);
    }
}

function drawLine(line, context){
    let x = line.x;
    let distance = line.distance;
    let blockType = line.tileType;

    let hue = 1 / ( (distance*0.4<1)? 1: distance*0.4 );

    let color;
    switch (blockType) {
        case "R":
            color = new Color(255 * hue, 40 * hue, 40 * hue);
            break;
        case "G":
            color = new Color(40 * hue, 255 * hue, 40 * hue);
            break;
        case "B":
            color = new Color(0 * hue, 0 * hue, 255 * hue);
            break;
        default:
            color = new Color(255 * hue, 255 * hue, 255 * hue);
    }

    let height = 100/distance;

    context.lineWidth = 2;
    context.strokeStyle = color.color;
    context.beginPath();
    context.moveTo(x+1, SCREEN_HEIGHT/2-(height/2)*WALL_SCALE);
    context.lineTo(x+1, SCREEN_HEIGHT/2+(height/2)*WALL_SCALE);
    context.stroke();
}

function drawFloor() {
    // Create linear gradient
    const grad= context.createLinearGradient(0,0, 0,SCREEN_HEIGHT);
    grad.addColorStop(0, "darkgray");
    grad.addColorStop(0.6, "gray")
    grad.addColorStop(1, "white");

// Fill rectangle with gradient
    context.fillStyle = grad;
    context.fillRect(0,SCREEN_HEIGHT/2, SCREEN_WIDTH,SCREEN_HEIGHT/2);

}
function drawCeiling() {
    // Create linear gradient
    const grad= context.createLinearGradient(0,0, 0,SCREEN_HEIGHT/2);
    grad.addColorStop(0, "lightblue");
    grad.addColorStop(1, "teal");

        // Fill rectangle with gradient
    context.fillStyle = grad;
    context.fillRect(0,0, SCREEN_WIDTH,SCREEN_HEIGHT/2);

}

document.onkeydown = function (e) {
    let rad = playerDir * Math.PI/180;
    let vectorX = Math.cos(rad);
    let vectorY = Math.sin(rad);
    switch (e.keyCode) {
        case 37:
            console.log('Left Key pressed!');
            playerDir -= SENSITIVITY
            playerDir = playerDir % 360;
            break;
        case 38:
            playerX += PLAYER_SPEED * vectorX;
            playerY += PLAYER_SPEED * vectorY;
            break;

        case 39:
            console.log('Right Key pressed!');
            playerDir += SENSITIVITY;
            playerDir = playerDir % 360;
            break;
        case 40:
            console.log('Down Key pressed!');
            playerX -= PLAYER_SPEED * vectorX;
            playerY -= PLAYER_SPEED * vectorY;
            break;
    }
};



//start code here

function updateScreen(){
    castRays();
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawFloor();
    drawCeiling();
    renderLinesOnCanvas();
}

setInterval(updateScreen, 30)