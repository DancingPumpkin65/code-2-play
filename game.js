console.log("Game.js loaded. Ninja Adventure awaits!");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const gridCols = 15, gridRows = 15, gridSize = 50;
canvas.width = gridCols * gridSize;
canvas.height = gridRows * gridSize;
let score = 0;

const ninjaImagePath = 'nin/Actor/Characters/Boy/SeparateAnim/Idle.png';
const appleImagePath = 'cpu.png';

const ninjaImage = new Image();
ninjaImage.src = ninjaImagePath;
const appleImage = new Image();
appleImage.src = appleImagePath;
const mapImage = new Image();
mapImage.src = 'map1.png';
const walkSheet = new Image();
walkSheet.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Walk.png';
const idleSheet = new Image();
idleSheet.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Idle.png';
const cpuStart = { col: 2, row: 9 };
const apple = { x: 0, y: 0, width: gridSize, height: gridSize };

const facesetBoxImage = new Image();
facesetBoxImage.src = 'nin/Ui/Dialog/FacesetBox.png';
const dialogueBoxImage = new Image();
dialogueBoxImage.src = 'nin/Ui/Dialog/DialogueBoxSimple.png';
const dialogFacesetImage = new Image();
dialogFacesetImage.src = 'nin/Ui/Dialog/DialogBoxFaceset.png';
const yesButtonImage = new Image();
yesButtonImage.src = 'nin/Ui/Dialog/YesButton.png';

let imagesLoaded = 0;
const totalImages = 9;

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        if (ninjaImage.naturalWidth > ninjaImage.naturalHeight) {
            isHorizontal = true;
            frameHeight = ninjaImage.naturalHeight;
            frameWidth = frameHeight;
            idleFrameCount = Math.floor(ninjaImage.naturalWidth / frameWidth);
        } else {
            isHorizontal = false;
            frameWidth = ninjaImage.naturalWidth;
            frameHeight = frameWidth;
            idleFrameCount = Math.floor(ninjaImage.naturalHeight / frameHeight);
        }
        scale = gridSize / frameWidth;
        idleFrameCount = 1;
        player.x = Math.floor(gridCols / 2) * gridSize;
        player.y = Math.floor(gridRows / 2) * gridSize;
        apple.x = cpuStart.col * gridSize;
        apple.y = cpuStart.row * gridSize;
        console.log(`Animation frames: ${idleFrameCount}, frame size: ${frameWidth}x${frameHeight}, horizontal: ${isHorizontal}`);
        gameLoop();
    }
}

function onImageError(e) {
    console.error("Error loading image:", e.target.src, e);
    alert("Failed to load game assets. Please check the console for details and ensure asset paths are correct.");
}

ninjaImage.onload = onImageLoad;
ninjaImage.onerror = onImageError;
appleImage.onload = onImageLoad;
appleImage.onerror = onImageError;
mapImage.onload = onImageLoad;
mapImage.onerror = onImageError;
walkSheet.onload = onImageLoad;
walkSheet.onerror = onImageError;
idleSheet.onload = onImageLoad;
idleSheet.onerror = onImageError;
facesetBoxImage.onload = onImageLoad;
facesetBoxImage.onerror = onImageError;
dialogueBoxImage.onload = onImageLoad;
dialogueBoxImage.onerror = onImageError;
dialogFacesetImage.onload = onImageLoad;
dialogFacesetImage.onerror = onImageError;
yesButtonImage.onload = onImageLoad;
yesButtonImage.onerror = onImageError;

let gameFrame = 0;
const staggerFrames = 10;
let idleFrameCount = 0;
let isHorizontal = true;
let frameWidth = 0;
let frameHeight = 0;
let scale;

class Player {
    constructor(x, y, gridSize) {
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;
        this.moveSpeed = gridSize / 20;
        this.moving = false;
        this.dx = 0;
        this.dy = 0;
        this.targetX = x;
        this.targetY = y;
        this.animations = {
            walkDown:  { image: walkSheet, frames: 4, cols: 4, rows: 4, dirIdx: 0 },
            walkUp:    { image: walkSheet, frames: 4, cols: 4, rows: 4, dirIdx: 1 },
            walkLeft:  { image: walkSheet, frames: 4, cols: 4, rows: 4, dirIdx: 2 },
            walkRight: { image: walkSheet, frames: 4, cols: 4, rows: 4, dirIdx: 3 },
            idleDown:  { image: idleSheet, frames: 1, cols: 4, rows: 1, dirIdx: 0 },
            idleUp:    { image: idleSheet, frames: 1, cols: 4, rows: 1, dirIdx: 1 },
            idleLeft:  { image: idleSheet, frames: 1, cols: 4, rows: 1, dirIdx: 2 },
            idleRight: { image: idleSheet, frames: 1, cols: 4, rows: 1, dirIdx: 3 }
        };
        this.current = 'idleDown';
        this.frameIndex = 0;
        this.tick = 0;
    }
    setAnimation(name) {
        if (this.current !== name) {
            this.current = name;
            this.frameIndex = 0;
            this.tick = 0;
        }
    }
    move(dx, dy) {
        if (this.moving) return;
        const nextX = this.x + dx * this.gridSize;
        const nextY = this.y + dy * this.gridSize;
        const nextCol = nextX / gridSize;
        const nextRow = nextY / gridSize;
        if (
            nextCol < 0 || nextCol >= gridCols ||
            nextRow < 0 || nextRow >= gridRows ||
            movementLimits[nextRow][nextCol] === 0
        ) return;
        this.dx = dx;
        this.dy = dy;
        this.targetX = nextX;
        this.targetY = nextY;
        if (dx > 0) this.setAnimation('walkRight');
        else if (dx < 0) this.setAnimation('walkLeft');
        else if (dy > 0) this.setAnimation('walkDown');
        else if (dy < 0) this.setAnimation('walkUp');
        this.moving = true;
    }
    update() {
        const anim = this.animations[this.current];
        if (this.moving) {
            this.x += this.dx * this.moveSpeed;
            this.y += this.dy * this.moveSpeed;
            this.tick++;
            if (this.tick > staggerFrames) {
                this.tick = 0;
                this.frameIndex = (this.frameIndex + 1) % anim.rows;
            }
            if ((this.dx > 0 && this.x >= this.targetX) ||
                (this.dx < 0 && this.x <= this.targetX) ||
                (this.dy > 0 && this.y >= this.targetY) ||
                (this.dy < 0 && this.y <= this.targetY)) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                if (this.dx > 0) this.setAnimation('idleRight');
                else if (this.dx < 0) this.setAnimation('idleLeft');
                else if (this.dy > 0) this.setAnimation('idleDown');
                else if (this.dy < 0) this.setAnimation('idleUp');
                this.dx = this.dy = 0;
                this.frameIndex = 0;
            }
        } else if (anim.frames > 1) {
            this.tick++;
            if (this.tick > staggerFrames) {
                this.tick = 0;
                this.frameIndex = (this.frameIndex + 1) % anim.rows;
            }
        }
    }
    draw(ctx) {
        const anim = this.animations[this.current];
        const fw = anim.image.naturalWidth / anim.cols;
        const fh = anim.image.naturalHeight / anim.rows;
        const sx = anim.dirIdx * fw;
        const sy = this.frameIndex * fh;
        ctx.drawImage(anim.image, sx, sy, fw, fh, this.x, this.y, this.gridSize, this.gridSize);
    }
}

const player = new Player(Math.floor(gridCols/2)*gridSize, Math.floor(gridRows/2)*gridSize, gridSize);

const movementLimits = [
    ...Array(gridRows).fill().map(() => Array(gridCols).fill(1))
];

function drawPlayer() {
    player.draw(ctx);
}

function drawApple() {
    if (appleImage.complete && appleImage.naturalHeight !== 0) {
         ctx.drawImage(appleImage, apple.x, apple.y, apple.width, apple.height);
    } else {
        ctx.fillStyle = 'red';
        ctx.fillRect(apple.x, apple.y, apple.width, apple.height);
    }
}

function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
}

function update() {
    player.update();
    if (player.x < 0) player.x = 0;
    if (player.x + gridSize > canvas.width) player.x = canvas.width - gridSize;
    if (player.y < 0) player.y = 0;
    if (player.y + gridSize > canvas.height) player.y = canvas.height - gridSize;
    if (
        player.x < apple.x + apple.width &&
        player.x + (frameWidth * scale) > apple.x &&
        player.y < apple.y + apple.height &&
        player.y + (frameHeight * scale) > apple.y
    ) {
        score++;
        scoreDisplay.textContent = score;
        resetApple();
    }
}

function resetApple() {
    const col = Math.floor(Math.random() * gridCols);
    const row = Math.floor(Math.random() * gridRows);
    apple.x = col * gridSize;
    apple.y = row * gridSize;
}

let showDialog = true;
const dialogText = 'Mission: Collect the CPU!';
let yesButtonRect = { x: 0, y: 0, width: 0, height: 0 };
