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
const infoPopup = document.querySelector('.info-popup');

// Game settings
const gridCols = 15, gridRows = 15, gridSize = 50;
canvas.width = gridCols * gridSize;
canvas.height = gridRows * gridSize;
let score = 0;

// Asset paths (relative to index.html)
const ninjaImagePath = 'nin/Actor/Characters/Boy/SeparateAnim/Idle.png'; // Using Idle for simplicity
const appleImagePath = 'lib/cpuu.png';

// Load images
const ninjaImage = new Image();
ninjaImage.src = ninjaImagePath;
const appleImage = new Image();
appleImage.src = appleImagePath;
// Map background image
const mapImage = new Image();
mapImage.src = 'lib/map3.png';
// Walk and idle sprite sheets
const walkSheet = new Image();
walkSheet.src = 'nin/Actor/Characters/Princess/SeparateAnim/Walk.png';
const idleSheet = new Image();
idleSheet.src = 'nin/Actor/Characters/Princess/SeparateAnim/Idle.png';
// Game item: CPU position on grid
const cpuStart = { col: 2, row: 9 };
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
knightFacesetImage.src = 'nin/Actor/Characters/Princess/Faceset.png';
// Dialog info popup sprite (4 frames)
const dialogInfoImage = new Image();
dialogInfoImage.src = 'nin/Ui/Dialog/DialogInfo.png';

// Item and death sprites
const itemImage = new Image(); itemImage.src = 'nin/Actor/Characters/Princess/SeparateAnim/Item.png';
const deadImage = new Image(); deadImage.src = 'nin/Actor/Characters/Princess/SeparateAnim/Dead.png';

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
    {col: 1, row: 0},
    {col: 1, row: 1},
    {col: 1, row: 2},
    {col: 1, row: 3},
    {col: 1, row: 4},
    {col: 1, row: 5},
    {col: 1, row: 6},
    {col: 2, row: 7},
    {col: 2, row: 8},
    {col: 1, row: 9},
    {col: 1, row: 10},
    {col: 2, row: 11},
    {col: 2, row: 12},
    {col: 1, row: 13},
    {col: 2, row: 14},
    {col: 5, row: 0},
    {col: 6, row: 0},
    {col: 5, row: 1},
    {col: 6, row: 1},
    {col: 9, row: 0},
    {col: 7, row: 3},
    {col: 8, row: 3},
    {col: 9, row: 2},
    {col: 9, row: 1},
    {col: 8, row: 4},
    {col: 9, row: 4},
    {col: 10, row: 4},
    {col: 11, row: 4},
    {col: 12, row: 5},
    {col: 13, row: 6},
    {col: 14, row: 6},
    {col: 4, row: 11},
    {col: 5, row: 11},
    {col: 6, row: 11},
    {col: 7, row: 11},
    {col: 8, row: 11},
    {col: 9, row: 11},
    {col: 10, row: 11},
    {col: 11, row: 11},
    {col: 12, row: 11},
    {col: 13, row: 11},
    {col: 14, row: 11},
    {col: 4, row: 12},
    {col: 4, row: 13},
    {col: 5, row: 14},
    {col: 6, row: 5},
    {col: 6, row: 6},
    {col: 7, row: 5},
    {col: 7, row: 6},
    
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

// Draw blocked collision cells in semi-transparent red
function drawCollisions() {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 0, 0, 0)'; // solid red for testing
    for (let row = 0; row < gridRows; row++) {
        for (let col = 0; col < gridCols; col++) {
            if (movementLimits[row][col] === 0) {
                ctx.fillRect(col * gridSize, row * gridSize, gridSize, gridSize);
            }
        }
    }
    ctx.restore();
}

// Draws the audio SVG icon beside dialog text
function drawAudioIcon(ctx, x, y, size = 24, color = '#A0A0A0') {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 24, size / 24);
    ctx.beginPath();
    // SVG path from user
    ctx.moveTo(3,9); ctx.lineTo(3,15); ctx.lineTo(7,15); ctx.lineTo(12,20); ctx.lineTo(12,4); ctx.lineTo(7,9); ctx.lineTo(3,9);
    ctx.moveTo(16.5,12); ctx.bezierCurveTo(16.5,10.23,15.48,8.71,14,7.97); ctx.lineTo(14,16.02); ctx.bezierCurveTo(15.48,15.29,16.5,13.77,16.5,12);
    ctx.moveTo(14,3.23); ctx.lineTo(14,5.29); ctx.bezierCurveTo(16.89,6.15,19,8.83,19,12); ctx.bezierCurveTo(19,15.17,16.89,17.85,14,18.71); ctx.lineTo(14,20.77); ctx.bezierCurveTo(18.01,19.86,21,16.28,21,12); ctx.bezierCurveTo(21,7.72,18.01,4.14,14,3.23);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
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
        player.x + (frameWidth * scale) > apple.x &&
        player.y < apple.y + apple.height &&
        player.y + (frameHeight * scale) > apple.y
    ) {
        cpuCollected = true;
        score += 10;
        // Animate player holding item
        player.setAnimation('item');
        // Animate progress bar to fill up to motherboard icon
        const mbIcon = document.getElementById('icon-motherboard');
        const progressBarContainer = document.getElementById('progress-bar-container');
        if (mbIcon && progressBarContainer) {
            const mbRect = mbIcon.getBoundingClientRect();
            const barRect = progressBarContainer.getBoundingClientRect();
            const fillPx = mbRect.left + mbRect.width/2 - barRect.left;
            progressBarContainer.style.setProperty('--__internal__progress-bar-value', `${fillPx}px`);
            const iconCpu = document.getElementById('icon-cpu');
            if (iconCpu) iconCpu.classList.add('achieved');
        }
        // Show dialog popup
        showDialog = true;
        dialogText = dialogTexts.EN[1]; // show language controls below the dialog
    }
}

// Dialog texts mapping [initial, after collect]
const dialogTexts = {
    EN: [
        'Mission : Collect the CPU!',
        'A CPU thinks really fast and tells the computer what to do.'
    ],
    FR: [
        'Mission : Récupère le processeur!',
        'Le processeur pense très vite et dit à l’ordinateur quoi faire.'
    ],
    AR: [
        '!المهمة : اجمع المعالج',
        '.المعالج يفكر بسرعة ويخبر الحاسوب بما يجب عليه فعله'
    ]
};

// Dialog state
let showDialog = true;
let dialogText = dialogTexts.EN[0]; // use initial EN dialog
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

    // visualize collision blocks
    drawCollisions();

    // show initial dialog using combined layout dimensions
    if (showDialog && dialogueBoxImage.complete && facesetBoxImage.complete && knightFacesetImage.complete && yesButtonImage.complete) {
        const combW = canvas.width * 0.8;
        const combScale = combW / dialogFacesetImage.naturalWidth;
        // fetch CSS variables for dialog/button styling
        const cssRoot = getComputedStyle(document.documentElement);
        const dialogTextOffsetX = parseFloat(cssRoot.getPropertyValue('--dialog-text-offset-x')) || 0;
        const dialogTextOffsetY = parseFloat(cssRoot.getPropertyValue('--dialog-text-offset-y')) || 0;
        const dialogFontCss = cssRoot.getPropertyValue('--dialog-font').trim();
        const dialogTextColor = cssRoot.getPropertyValue('--dialog-text-color').trim();
        const btnBg = cssRoot.getPropertyValue('--dialog-btn-bg').trim();
        const btnTextColor = cssRoot.getPropertyValue('--dialog-btn-text').trim();
        const btnBorderColor = cssRoot.getPropertyValue('--dialog-btn-border-color').trim();
        const btnBorderWidth = parseFloat(cssRoot.getPropertyValue('--dialog-btn-border-width')) || 0;
        const btnBorderRadius = parseFloat(cssRoot.getPropertyValue('--dialog-btn-border-radius')) || 0;
        const btnFontCss = cssRoot.getPropertyValue('--dialog-btn-font').trim();
        // parse button font for labels
        const [btnBaseSizeStr, ...btnFontFamilyParts] = btnFontCss.split(' ');
        const btnBaseSize = parseFloat(btnBaseSizeStr) || 7;
        const btnFontFamily = btnFontFamilyParts.join(' ') || 'sans-serif';
        // fetch optional custom button dimensions
        const customBtnW = parseFloat(cssRoot.getPropertyValue('--dialog-btn-width')) || 0;
        const customBtnH = parseFloat(cssRoot.getPropertyValue('--dialog-btn-height')) || 0;
        // helper to draw rounded rectangles
        function drawRoundedRect(ctx, x, y, w, h, r) {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        }
        const combH = dialogFacesetImage.naturalHeight * combScale;
        const combX = (canvas.width - combW) / 2;
        const combY = canvas.height - combH - 20;
        // draw combined background under Faceset and DialogueBoxSimple
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
        // overlay text with horizontal offset from CSS var and use CSS-driven font/color
        // parse CSS font (e.g. "15px Pixelify Sans") and scale size
        const [baseSizeStr, ...fontFamilyParts] = dialogFontCss.split(' ');
        const baseSize = parseFloat(baseSizeStr) || (13);
        const fontFamily = fontFamilyParts.join(' ') || 'sans-serif';
        ctx.font = `${baseSize * combScale}px ${fontFamily}`;
        ctx.fillStyle = dialogTextColor || '#000';
        // wrap dialogText inside the dialog box with left alignment
        ctx.textAlign = 'left';
        const fontSizePx = baseSize * combScale;
        const textX = dlgX + 10 * combScale + dialogTextOffsetX * combScale;
        const initialY = dlgY + fontSizePx + dialogTextOffsetY * combScale;
        const maxTextWidth = dlgW - 20 * combScale;
        const lineHeight = fontSizePx * 1.2;
        const words = dialogText.split(' ');
        let line = '';
        let y = initialY;
        let firstLineWidth = 0;
        let firstLineY = initialY;
        let firstLine = true;
        for (const word of words) {
            const testLine = line + word + ' ';
            if (ctx.measureText(testLine).width > maxTextWidth && line) {
                ctx.fillText(line, textX, y);
                if (firstLine) {
                    firstLineWidth = ctx.measureText(line).width;
                    firstLineY = y;
                    firstLine = false;
                }
                line = word + ' ';
                y += lineHeight;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, textX, y);
        if (firstLine) {
            firstLineWidth = ctx.measureText(line).width;
            firstLineY = y;
        }
        // Draw audio icon beside the first line of dialog text
        const iconSize = fontSizePx * 1;
        const iconOffsetX = 2 * combScale; // horizontal space from text
        const iconOffsetY = 10; // vertical adjustment if needed
        const iconX = textX + firstLineWidth + iconOffsetX;
        const iconY = firstLineY - fontSizePx + (fontSizePx - iconSize) / 2 + iconOffsetY;
        drawAudioIcon(ctx, iconX, iconY, iconSize, '#A0A0A0');
        // Yes button
        const btnW = combW * 0.1;
        const btnH = yesButtonImage.naturalHeight * (btnW / yesButtonImage.naturalWidth);
        // choose language button size: custom override or match Yes button
        const lbWidth = customBtnW > 0 ? customBtnW * combScale : btnW;
        const lbHeight = customBtnH > 0 ? customBtnH * combScale : btnH;
        // spacing and language codes for buttons
        const btnGap = 3 * combScale;
        const langs = ['EN','FR','AR'];
        const btnX = combX + combW - btnW - 10 * combScale;
        const btnY = combY + combH - btnH - 10 * combScale;
        ctx.drawImage(yesButtonImage, btnX, btnY, btnW, btnH);
        yesButtonRect = { x: btnX, y: btnY, width: btnW, height: btnH };
        // Draw language buttons with CSS variable-driven styles
        const dialogBtnOffsetX = parseFloat(cssRoot.getPropertyValue('--dialog-btn-offset-x')) || 0;
        const dialogBtnOffsetY = parseFloat(cssRoot.getPropertyValue('--dialog-btn-offset-y')) || 0;
        ctx.font = `${btnBaseSize * combScale}px ${'Pixelify Sans'}`;
        ctx.fillStyle = btnTextColor;
        langs.forEach((lang, i) => {
            // compute x/y for each button
            const lx = btnX - btnGap - (i + 1) * lbWidth - i * btnGap + dialogBtnOffsetX * combScale;
            const ly = btnY + dialogBtnOffsetY * combScale;
            // background and border
            ctx.fillStyle = btnBg;
            ctx.strokeStyle = btnBorderColor;
            ctx.lineWidth = btnBorderWidth * combScale;
            drawRoundedRect(ctx, lx, ly, lbWidth, lbHeight, btnBorderRadius * combScale);
            ctx.fill();
            ctx.stroke();
            // draw label
            ctx.fillStyle = btnTextColor;
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
                // update dialogText based on mapping
                const stage = cpuCollected ? 1 : 0;
                dialogText = (dialogTexts[btn.lang] || dialogTexts.EN)[stage];
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

// Add this at the end of the body in your HTML (index.html or girl_version.html):
// <div id="audio-icon-svg" style="position:absolute;z-index:10;pointer-events:auto;display:none;">
//   <svg viewBox="0 0 24 24" class="bot-audio-icon" width="32" height="32" fill="#222">
//     <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
//   </svg>
// </div>