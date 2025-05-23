// Placeholder for game.js
// We will populate this with game logic in the next steps.
console.log("Game.js loaded. Ninja Adventure awaits!");

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

// Grab progress bar and CPU icon elements
const progressBarFill = document.getElementById('progress-bar-fill');
const iconCpu = document.getElementById('icon-cpu');
const progressBarContainer = document.getElementById('progress-bar-container');
const infoPopup = document.querySelector('.info-popup'); // info popup element
// Removed langControls and language button variables

// Game settings
const gridCols = 15, gridRows = 15, gridSize = 50;
canvas.width = gridCols * gridSize;
canvas.height = gridRows * gridSize;
let score = 0;

// Asset paths (relative to index.html)
const ninjaImagePath = 'nin/Actor/Characters/Boy/SeparateAnim/Idle.png'; // Using Idle for simplicity
const appleImagePath = 'cpu.png';

// Load images
const ninjaImage = new Image();
ninjaImage.src = ninjaImagePath;
const appleImage = new Image();
appleImage.src = appleImagePath;
// Map background image
const mapImage = new Image();
mapImage.src = 'map1.png';
// Walk and idle sprite sheets
const walkSheet = new Image();
walkSheet.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Walk.png';
const idleSheet = new Image();
idleSheet.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Idle.png';
// Game item: CPU position on grid
const cpuStart = { col: 2, row: 9 }; // specify CPU tile coordinates
const apple = { x: 0, y: 0, width: gridSize, height: gridSize };

// flag to track CPU collection
let cpuCollected = false;

// Dialog box assets

// Dialog box frame image
const facesetBoxImage = new Image();
facesetBoxImage.src = 'nin/Ui/Dialog/FacesetBox.png';
const dialogueBoxImage = new Image();
dialogueBoxImage.src = 'nin/Ui/Dialog/DialogueBoxSimple.png';
// Dialog combined background image
const dialogFacesetImage = new Image();
dialogFacesetImage.src = 'nin/Ui/Dialog/DialogBoxFaceset.png';
// YesButton asset for dismissing dialog
const yesButtonImage = new Image();
yesButtonImage.src = 'nin/Ui/Dialog/YesButton.png';
// Character faceset image
const knightFacesetImage = new Image();
knightFacesetImage.src = 'nin/Actor/Characters/KnightGold/Faceset.png';
// Dialog info popup sprite (4 frames)
const dialogInfoImage = new Image();
dialogInfoImage.src = 'nin/Ui/Dialog/DialogInfo.png';

// Item and death sprites
const itemImage = new Image(); itemImage.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Item.png';
const deadImage = new Image(); deadImage.src = 'nin/Actor/Characters/KnightGold/SeparateAnim/Dead.png';

// --- Image Loading Check ---
let imagesLoaded = 0;
// Count each image loadable (including new knightFacesetImage)
const totalImages = 13; // ninjaImage, appleImage, mapImage, walkSheet, idleSheet, facesetBox, dialogueBox, dialogFacesetImage, yesButtonImage, knightFacesetImage, dialogInfoImage, itemImage, deadImage

function onImageLoad() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        // determine sprite orientation and calculate frames
        if (ninjaImage.naturalWidth > ninjaImage.naturalHeight) {
            // horizontal strip: frames are square based on image height
            isHorizontal = true;
            frameHeight = ninjaImage.naturalHeight;
            frameWidth = frameHeight;
            idleFrameCount = Math.floor(ninjaImage.naturalWidth / frameWidth);
        } else {
            // vertical strip: frames are square based on image width
            isHorizontal = false;
            frameWidth = ninjaImage.naturalWidth;
            frameHeight = frameWidth;
            idleFrameCount = Math.floor(ninjaImage.naturalHeight / frameHeight);
        }
        // scale sprite to occupy one grid cell
        scale = gridSize / frameWidth;
        // force single-frame player sprite
        idleFrameCount = 1;
        // center player on grid
        player.x = Math.floor(gridCols / 2) * gridSize;
        player.y = Math.floor(gridRows / 2) * gridSize;
        // place CPU at specified position
        apple.x = cpuStart.col * gridSize;
        apple.y = cpuStart.row * gridSize;
        console.log(`Animation frames: ${idleFrameCount}, frame size: ${frameWidth}x${frameHeight}, horizontal: ${isHorizontal}`);
        gameLoop(); // Start the game loop only after images are loaded and frames determined
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
knightFacesetImage.onload = onImageLoad;
knightFacesetImage.onerror = onImageError;
dialogInfoImage.onload = onImageLoad;
dialogInfoImage.onerror = onImageError;
itemImage.onload = onImageLoad; itemImage.onerror = onImageError;
deadImage.onload = onImageLoad; deadImage.onerror = onImageError;

// Animation settings
let gameFrame = 0;
const staggerFrames = 10;
// Dynamic frame slicing
let idleFrameCount = 0;
let isHorizontal = true;
let frameWidth = 0;
let frameHeight = 0;
let scale; // will be set to fill one grid cell

// Player class with multiple animations
class Player {
    constructor(x, y, gridSize) {
        this.x = x;
        this.y = y;
        this.gridSize = gridSize;
        this.moveSpeed = gridSize / 20; // pixels per frame to move one cell in 8 frames
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
            idleRight: { image: idleSheet, frames: 1, cols: 4, rows: 1, dirIdx: 3 },
            item:    { image: itemImage, frames: 1, cols: 1, rows: 1, dirIdx: 0 },
            dead:    { image: deadImage, frames: 1, cols: 1, rows: 1, dirIdx: 0 }
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
        if (cpuCollected) return; // prevent movement after item collected
        // block movement during initial dialog
        if (showDialog) return;
        if (this.moving) return;
        // calculate next grid-coordinates
        const nextX = this.x + dx * this.gridSize;
        const nextY = this.y + dy * this.gridSize;
        // enforce grid-based movement limits
        const nextCol = nextX / gridSize;
        const nextRow = nextY / gridSize;
        if (nextCol < 0 || nextCol >= gridCols ||
            nextRow < 0 || nextRow >= gridRows ||
            movementLimits[nextRow][nextCol] === 0) {
            this.setAnimation('dead');
            return;
        }
        // set movement and animation
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
        if (this.current === 'item') return; // freeze item pose
        const anim = this.animations[this.current];
        if (this.moving) {
            // move towards target
            this.x += this.dx * this.moveSpeed;
            this.y += this.dy * this.moveSpeed;
            // animation tick
            this.tick++;
            if (this.tick > staggerFrames) {
                this.tick = 0;
                this.frameIndex = (this.frameIndex + 1) % anim.rows;
            }
            // check arrival
            if ((this.dx > 0 && this.x >= this.targetX) ||
                (this.dx < 0 && this.x <= this.targetX) ||
                (this.dy > 0 && this.y >= this.targetY) ||
                (this.dy < 0 && this.y <= this.targetY)) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.moving = false;
                // set idle based on last direction
                if (this.dx > 0) this.setAnimation('idleRight');
                else if (this.dx < 0) this.setAnimation('idleLeft');
                else if (this.dy > 0) this.setAnimation('idleDown');
                else if (this.dy < 0) this.setAnimation('idleUp');
                this.dx = this.dy = 0;
                this.frameIndex = 0;
            }
        } else if (anim.frames > 1) {
            // idle frames if any (but idleSheet frames=1 row so no)
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

// instantiate player at center
const player = new Player(Math.floor(gridCols/2)*gridSize, Math.floor(gridRows/2)*gridSize, gridSize);

// Movement limits: 2D array specifying passable cells (1) and blocked cells (0)
const movementLimits = [
    // each sub-array is a row of gridCols length; 1=passable, 0=blocked
    // fill with 1s by default; update specific cells to 0 to block
    ...Array(gridRows).fill().map(() => Array(gridCols).fill(1))
];
// --- Custom collision blocks ---
// Define coordinates (col,row) of tiles to block
const collisionBlocks = [
    {col: 3, row: 5},
    {col: 4, row: 5},
    {col: 5, row: 5},
    {col: 6, row: 5},
    {col: 7, row: 5}
];
// Apply blocks
collisionBlocks.forEach(({col,row}) => {
    if (row >= 0 && row < gridRows && col >= 0 && col < gridCols) {
        movementLimits[row][col] = 0;
    }
});

// --- Draw functions ---
function drawPlayer() {
    player.draw(ctx);
}

function drawApple() {
    if (!cpuCollected && appleImage.complete && appleImage.naturalHeight !== 0) {
        ctx.drawImage(appleImage, apple.x, apple.y, apple.width, apple.height);
    } else {
        // Fallback drawing
        if (!cpuCollected) {
            ctx.fillStyle = 'red';
            ctx.fillRect(apple.x, apple.y, apple.width, apple.height);
        }
    }
}

// Draw a simple grid on the canvas with 32×32 cells for debugging
function drawGrid() {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0)';
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }
    ctx.restore();
}

// --- Update game state ---
function update() {
    player.update();
    // No continuous movement; player moves on key events or UI taps

    // Keep player within bounds
    if (player.x < 0) player.x = 0;
    if (player.x + gridSize > canvas.width) player.x = canvas.width - gridSize;
    if (player.y < 0) player.y = 0;
    if (player.y + gridSize > canvas.height) player.y = canvas.height - gridSize;

    // Check for CPU collection collision
    if (!cpuCollected &&
        player.x < apple.x + apple.width &&
        player.x + gridSize > apple.x &&
        player.y < apple.y + apple.height &&
        player.y + gridSize > apple.y) {
        cpuCollected = true;
        score += 10;

        // Animate player holding item
        player.setAnimation('item');

        // Animate progress bar to fill up to motherboard icon
        // Calculate the midpoint of the motherboard icon
        const mbIcon = document.getElementById('icon-motherboard');
        const mbRect = mbIcon.getBoundingClientRect();
        const barRect = progressBarContainer.getBoundingClientRect();
        // Relative position within the bar
        const fillPx = mbRect.left + mbRect.width/2 - barRect.left;
        progressBarContainer.style.setProperty('--__internal__progress-bar-value', `${fillPx}px`);
        iconCpu.classList.add('achieved');

        // Show dialog popup
        showDialog = true;
        dialogText = 'A CPU thinks really fast and tells the computer what to do';
        // show language controls below the dialog
        // if (langControls) langControls.style.display = 'flex';
    }
}

// Dialog state
let showDialog = true;
let dialogText = 'Mission: Collect the CPU!';
// rectangle to track YesButton position
let yesButtonRect = { x: 0, y: 0, width: 0, height: 0 };
// language button rectangles for canvas dialog
let languageButtons = []; // each { x, y, width, height, lang }
// dialogInfo animation settings
const dialogInfoFrameCount = 4;
let dialogInfoFrame = 0, dialogInfoTick = 0;
const dialogInfoStagger = 10;
let dialogInfoTimer = 0, dialogInfoDuration = 60;

// --- Game loop ---
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // disable image smoothing for pixel-art clarity
    ctx.imageSmoothingEnabled = false;

    // draw map background
    if (mapImage.complete && mapImage.naturalWidth) {
        ctx.drawImage(mapImage, 0, 0, canvas.width, canvas.height);
    }

    // show initial dialog using combined layout dimensions
    if (showDialog && dialogueBoxImage.complete && facesetBoxImage.complete && knightFacesetImage.complete && yesButtonImage.complete) {
        const combW = canvas.width * 0.8;
        const combScale = combW / dialogFacesetImage.naturalWidth;
        const combH = dialogFacesetImage.naturalHeight * combScale;
        const combX = (canvas.width - combW) / 2;
        const combY = canvas.height - combH - 20;
        // draw combined background under FacesetBox and DialogueBoxSimple
        ctx.drawImage(dialogFacesetImage, combX, combY, combW, combH);
        // Faceset box on left
        const fsW = 48 * combScale;
        const fsH = 48 * combScale;
        const fsX = combX;
        const fsY = combY + (combH - fsH);
        ctx.drawImage(facesetBoxImage, fsX, fsY, fsW, fsH);
        ctx.drawImage(knightFacesetImage, fsX + 5 * combScale, fsY + 5 * combScale, fsW - 10 * combScale, fsH - 10 * combScale);
        // Dialogue box on right
        const dlgW = 250 * combScale;
        const dlgH = 48 * combScale;
        const dlgX = combX + fsW;
        const dlgY = combY + (combH - dlgH);
        ctx.drawImage(dialogueBoxImage, dlgX, dlgY, dlgW, dlgH);
        // overlay text
        ctx.font = `${13 * combScale}px sans-serif`;
        ctx.fillStyle = '#000000';
        ctx.fillText(dialogText, dlgX + 10 * combScale, dlgY + dlgH / 2);
        // Yes button
        const btnW = combW * 0.1;
        const btnH = yesButtonImage.naturalHeight * (btnW / yesButtonImage.naturalWidth);
        const btnX = combX + combW - btnW - 10 * combScale;
        const btnY = combY + combH - btnH - 10 * combScale;
        ctx.drawImage(yesButtonImage, btnX, btnY, btnW, btnH);
        yesButtonRect = { x: btnX, y: btnY, width: btnW, height: btnH };
        // Draw language buttons at left of YesButton
        const lbWidth = btnW;
        const lbHeight = btnH;
        const btnGap = 3 * combScale;
        const langs = ['EN','FR','AR'];
        languageButtons = [];
        ctx.font = `${7 * combScale}px sans-serif`;
        langs.forEach((lang, i) => {
            // compute x offset left of YesButton
            const lx = btnX - btnGap - (i + 1) * lbWidth - i * btnGap;
            const ly = btnY;
            // draw button background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(lx, ly, lbWidth, lbHeight);
            // draw label
            ctx.fillStyle = '#000000';
            ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
            ctx.fillText(lang, lx + lbWidth / 2, ly + lbHeight / 2);
            // store click regions
            languageButtons.push({ x: lx, y: ly, width: lbWidth, height: lbHeight, lang });
        });
    }

    // DEBUG: visualize canvas grid of 32×32 cells
    drawGrid();

    drawPlayer();
    drawApple();
    update();
    drawDialogInfo();

    // increment frame counter for animations
    gameFrame++;

    requestAnimationFrame(gameLoop);
}

// animate and draw dialogInfo icon above CPU
function drawDialogInfo() {
    // show when player is within one grid cell of CPU
    if (!cpuCollected && dialogInfoImage.complete &&
        Math.abs(player.x - apple.x) <= gridSize &&
        Math.abs(player.y - apple.y) <= gridSize
    ) {
        const fw = dialogInfoImage.naturalWidth / dialogInfoFrameCount;
        const fh = dialogInfoImage.naturalHeight;
        const sx = dialogInfoFrame * fw;
        const sy = 0;
        // position slightly above CPU
        const x = apple.x + (apple.width - fw) / 2;
        const y = apple.y - fh - 5;
        ctx.drawImage(dialogInfoImage, sx, sy, fw, fh, x, y, fw, fh);
        dialogInfoTick++;
        if (dialogInfoTick > dialogInfoStagger) {
            dialogInfoTick = 0;
            dialogInfoFrame = (dialogInfoFrame + 1) % dialogInfoFrameCount;
        }
    }
}

// --- Event listeners ---
function keyDown(e) {
    switch(e.key) {
        case 'ArrowRight':
            player.move(1, 0); break;
        case 'ArrowLeft':
            player.move(-1, 0); break;
        case 'ArrowUp':
            player.move(0, -1); break;
        case 'ArrowDown':
            player.move(0, 1); break;
    }
}

document.addEventListener('keydown', keyDown);

// --- UI button controls ---
function setupUIControls() {
    document.getElementById('btn-up').addEventListener('click', () => {
        player.move(0, -1);
        pressButton('btn-up');
    });
    document.getElementById('btn-down').addEventListener('click', () => {
        player.move(0, 1);
        pressButton('btn-down');
    });
    document.getElementById('btn-left').addEventListener('click', () => {
        player.move(-1, 0);
        pressButton('btn-left');
    });
    document.getElementById('btn-right').addEventListener('click', () => {
        player.move(1, 0);
        pressButton('btn-right');
    });
}

setupUIControls();

const directionClasses = {
    "btn-up": "press-up",
    "btn-down": "press-down",
    "btn-left": "press-left",
    "btn-right": "press-right"
};

const keyMap = {
    ArrowUp: "btn-up",
    ArrowDown: "btn-down",
    ArrowLeft: "btn-left",
    ArrowRight: "btn-right",
    KeyW: "btn-up",
    KeyS: "btn-down",
    KeyA: "btn-left",
    KeyD: "btn-right"
};

function pressButton(btnId) {
    const btn = document.getElementById(btnId);
    if (!btn) return;

    const cls = directionClasses[btnId];
    if (cls) { // Check if class exists for the button
        btn.classList.add(cls);
        setTimeout(() => {
            btn.classList.remove(cls);
        }, 150);
    }
}

document.addEventListener("keydown", e => {
    const btnId = keyMap[e.code];
    if (btnId) {
        // Simulate button click for game logic
        const btn = document.getElementById(btnId);
        if(btn) btn.click(); // This will also trigger the pressButton via the click listener
    }
});

// hide dialog on YesButton click
canvas.addEventListener('click', function(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    if (showDialog) {
        // check language button clicks
        for (const btn of languageButtons) {
            if (clickX >= btn.x && clickX <= btn.x + btn.width &&
                clickY >= btn.y && clickY <= btn.y + btn.height) {
                // update dialogText by lang
                if (btn.lang === 'EN') dialogText = 'A CPU thinks really fast and tells the computer what to do';
                if (btn.lang === 'FR') dialogText = 'Le processeur pense très vite et dit à l’ordinateur quoi faire';
                if (btn.lang === 'AR') dialogText = 'المعالج يفكر بسرعة ويخبر الحاسوب بما يجب عليه فعله';
                return;
            }
        }
        // check Yes button
        if (clickX >= yesButtonRect.x && clickX <= yesButtonRect.x + yesButtonRect.width &&
            clickY >= yesButtonRect.y && clickY <= yesButtonRect.y + yesButtonRect.height) {
            showDialog = false;
            // hide language controls when dialog closed
            // if (langControls) langControls.style.display = 'none';
            }
    }
});

// Initial message to confirm script is running
console.log("Ninja Apple Collector game script initialized.");
// Note: gameLoop will be started by onImageLoad once images are ready.
// If images are already cached and loaded fast, it might start almost immediately.
// If there's an issue with image loading, the gameLoop won't start.

// Fallback if images don't load for some reason after a timeout (e.g. path errors not caught by onerror)
let gameLoopStarted = false; // Declare gameLoopStarted here
setTimeout(() => {
    if (imagesLoaded !== totalImages) {
        console.warn("Images did not load within timeout. Attempting to start game with placeholders.");
        if(imagesLoaded < totalImages && !ninjaImage.onerror && !appleImage.onerror){ // if no error was explicitly caught
             alert("Game assets might be missing or paths incorrect. The game will try to run with placeholders. Check console (F12) for errors.");
        }
        // Try to start the game loop anyway, draw functions have fallbacks
        if (typeof gameLoop === "function" && !gameLoopStarted) {
             // A bit risky if gameLoop itself has issues, but let's try
             // To prevent multiple calls if something is weird.
             if (!gameLoopStarted) { // This check is now fine
                gameLoop();
                gameLoopStarted = true;
             }
        }
    }
}, 5000); // 5 seconds timeout
