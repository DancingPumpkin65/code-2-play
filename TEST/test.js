const canvas = document.getElementById('tileMapCanvas');
const layers = [tileLayer1, tileLayer2];
const renderer = new TileMapRenderer(
    canvas,
    'TilesetField.png',
    layers,
    16,                    // tileSize
    19,                    // mapCols
    tileLayer1.length / 19 // mapRows
);