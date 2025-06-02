const renderer = new TileMapRenderer({
    canvasId: 'tileMapCanvas1',
    tileSize: 16,
    mapCols: 19,
    layers: [
        {
            name:        'Floor',
            tilesetSrc:  'TILESETS/TilesetFloor.png',
            tilewidth:   16,
            tileheight:  16,
            tilecount:   572,
            columns:     22,
            width:       352,
            height:      417,
            firstGid:    580,
            data:        tileLayer3,
            collision:   false
        },
        {
            name:        'Field',
            tilesetSrc:  'TILESETS/TilesetField.png',
            tilewidth:   16,
            tileheight:  16,
            tilecount:   75,
            columns:     5,
            width:       80,
            height:      240,
            firstGid:    1,
            data:        tileLayer2,
            collision:   false
        }
    ]
});
