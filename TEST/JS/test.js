const renderer1 = new TileMapRenderer({
    canvasId: 'tileMapCanvas1',
    tilesetSrc: 'TILESETS/TilesetField.png',
    tileSize: 16,
    mapCols: 19,
    layers: [ tileLayer1, tileLayer2 ],
    firstGid: 1
});

const renderer2 = new TileMapRenderer({
    canvasId: 'tileMapCanvas2',
    tilesetSrc: 'TILESETS/TilesetFloor.png',
    tileSize: 16,
    mapCols: 19,
    layers: [ tileLayer3 ],
    firstGid: 580
});
