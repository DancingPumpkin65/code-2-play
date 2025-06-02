const renderer = new TileMapRenderer({
    canvasId: 'tileMapCanvas1',
    tileSize: 16,
    mapCols: 19,
    layers: [
        { data: tileLayer3, tilesetSrc: 'TILESETS/TilesetFloor.png', firstGid: 580 },
        { data: tileLayer2, tilesetSrc: 'TILESETS/TilesetField.png', firstGid: 1 }
    ]
});
