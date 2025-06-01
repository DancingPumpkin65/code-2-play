class TileMapRenderer {
    constructor({ canvasId, tilesetSrc, layers, tileSize, mapCols, mapRows, firstGid = 1 }) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.tilesetImage = new Image();
        this.tilesetImage.src = tilesetSrc;
        this.layers = layers;
        this.tileSize = tileSize;
        this.mapCols = mapCols;
        this.mapRows = mapRows || (layers[0].length / mapCols) | 0;
        this.tilesPerRowInImage = 0;
        this.imageLoaded = false;
        this.firstGid = firstGid;

        this.canvas.width = this.mapCols * this.tileSize;
        this.canvas.height = this.mapRows * this.tileSize;

        this.tilesetImage.onload = () => {
            this.tilesPerRowInImage = Math.floor(this.tilesetImage.width / this.tileSize);
            this.imageLoaded = true;
            this.renderAll();
        };
    }

    renderAll() {
        if (!this.imageLoaded) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => this.renderLayer(layer));
    }

    renderLayer(layerData) {
        for (let row = 0; row < this.mapRows; row++) {
            for (let col = 0; col < this.mapCols; col++) {
                const idx = row * this.mapCols + col;
                const gid = layerData[idx];
                if (!gid || gid < this.firstGid) continue;
                const localId = gid - this.firstGid + 1;
                const imgCol = (localId - 1) % this.tilesPerRowInImage;
                const imgRow = Math.floor((localId - 1) / this.tilesPerRowInImage);
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