const renderer1 = new TileMapRenderer({
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
            firstGrid:    580,
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
            firstGrid:    1,
            data:        tileLayer2,
            collision:   false
        }
    ]
});

const renderer2 = new TileMapRenderer({
    canvasId: 'tileMapCanvas2',
    tileSize: 16,
    mapCols: 19,
    layers: [
        {
            name:        'Floor',
            tilesetSrc:  'TILESETS/TilesetField.png',
            tilewidth:   16,
            tileheight:  16,
            tilecount:   75,
            columns:     5,
            width:       80,
            height:      240,
            firstGrid:    1,
            data:        tileLayer1,
            collision:   false
        },
        {
            name:        'Field',
            tilesetSrc:  'TILESETS/TilesetFloor.png',
            tilewidth:   16,
            tileheight:  16,
            tilecount:   572,
            columns:     22,
            width:       352,
            height:      417,
            firstGrid:    580,
            data:        tileLayer4,
            collision:   false
        }
    ]
});