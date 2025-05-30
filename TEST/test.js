const canvas = document.getElementById('tileMapCanvas');
const ctx = canvas.getContext('2d');

ctx.imageSmoothingEnabled = false;

const tileSize = 16;
const tilesPerRowInImage = 5;
const mapCols = 19;

const mapRows = tileLayer1.length / mapCols;

canvas.width = mapCols * tileSize;
canvas.height = mapRows * tileSize;

const tilesetImage = new Image();
tilesetImage.src = 'TilesetField.png'; // Path to your tileset image

tilesetImage.onload = () => {
    // First, render base layer (tileLayer1)
    renderTileLayer(tileLayer1);
    
    // Then, render the top layer (tileLayer2)
    renderTileLayer(tileLayer2);
};

function renderTileLayer(layerData) {
    for (let row = 0; row < mapRows; row++) {
        for (let col = 0; col < mapCols; col++) {
            const tileIndex = row * mapCols + col;
            const tileID = layerData[tileIndex];

            if (tileID === 0) {
                continue; // Skip empty tiles
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
}

tilesetImage.onerror = () => {
    console.error('Failed to load the tileset image.');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Error: Could not load TilesetField.png', canvas.width / 2, canvas.height / 2);
};