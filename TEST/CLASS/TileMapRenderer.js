class TileMapRenderer {
    constructor(canvas, tilesetSrc, layers, tileSize, mapCols, mapRows) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.tilesetImage = new Image();
        this.tilesetImage.src = tilesetSrc;
        this.layers = layers;
        this.tileSize = tileSize;
        this.mapCols = mapCols;
        this.mapRows = mapRows;
        this.tilesPerRowInImage = 0;

        this.canvas.width = mapCols * tileSize;
        this.canvas.height = mapRows * tileSize;

        this.tilesetImage.onload = () => {
            this.tilesPerRowInImage = this.tilesetImage.width / this.tileSize;
            this.renderAll();
        };
    }

    renderAll() {
        this.layers.forEach(layer => this.renderLayer(layer));
    }

    renderLayer(layerData) {
        for (let row = 0; row < this.mapRows; row++) {
            for (let col = 0; col < this.mapCols; col++) {
                const idx = row * this.mapCols + col;
                const id = layerData[idx];
                if (!id) continue;

                const imgCol = (id - 1) % this.tilesPerRowInImage;
                const imgRow = Math.floor((id - 1) / this.tilesPerRowInImage);

                const sx = imgCol * this.tileSize;
                const sy = imgRow * this.tileSize;
                const dx = col * this.tileSize;
                const dy = row * this.tileSize;

                this.ctx.drawImage(
                    this.tilesetImage,
                    sx, sy, this.tileSize, this.tileSize,
                    dx, dy, this.tileSize, this.tileSize
                );
            }
        }
    }
}