// filepath: c:\Users\MAHITO\Downloads\ccczcz\code-2-play\TEST\test.js
const canvas = document.getElementById('tileMapCanvas');
const ctx = canvas.getContext('2d');

const tileSize = 16; // Each tile is 16x16 pixels
const tilesPerRowInImage = 16; // Number of tiles per row in the tileset image
const mapCols = 19; // As per data.js, each row has 19 elements

// Assuming tileLayer1 is available from data.js
const mapRows = tileLayer1.length / mapCols;

canvas.width = mapCols * tileSize;
canvas.height = mapRows * tileSize;

const tilesetImage = new Image();
tilesetImage.src = 'TilesetField.png'; // Path to your tileset image

tilesetImage.onload = () => {
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            const tileIndex = row * mapCols + col;
            const tileID = tileLayer1[tileIndex];

            if (tileID === 0) {
                continue;
            }

            // tileID = (imageRow * tilesPerRowInImage) + imageCol + 1
            const imageCol = (tileID - 1) % tilesPerRowInImage;
            const imageRow = Math.floor((tileID - 1) / tilesPerRowInImage);

            const sourceX = imageCol * tileSize;
            const sourceY = imageRow * tileSize;

            const destX = col * tileSize;
            const destY = row * tileSize;

            ctx.drawImage(
                tilesetImage,
                sourceX,
                sourceY,
                tileSize,
                tileSize,
                destX,
                destY,
                tileSize,
                tileSize
            );
        }
    }
};

tilesetImage.onerror = () => {
    console.error('Failed to load the tileset image.');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Error: Could not load TilesetField.png', canvas.width / 2, canvas.height / 2);
};