class TileMapRenderer {
    constructor({ canvasId, tileSize, mapCols, mapRows, layers }) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.tileSize = tileSize;
        this.mapCols = mapCols;
        this.mapRows = mapRows || (layers[0].data.length / mapCols) | 0;
        this.layers = layers;  // each: { data, tilesetSrc, firstGid }

        // load each unique tileset image
        const srcs = [...new Set(layers.map(l => l.tilesetSrc))];
        this.tilesetImages = {};
        this.tilesPerRow = {};
        let loaded = 0;
        srcs.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.tilesPerRow[src] = Math.floor(img.width / this.tileSize);
                if (++loaded === srcs.length) this.renderAll();
            };
            this.tilesetImages[src] = img;
        });

        this.canvas.width = this.mapCols * this.tileSize;
        this.canvas.height = this.mapRows * this.tileSize;
    }

    renderAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => this.renderLayer(layer));
    }

    renderLayer({ data, tilesetSrc, firstGid }) {
        const img = this.tilesetImages[tilesetSrc];
        const tpr = this.tilesPerRow[tilesetSrc];
        for (let i = 0; i < data.length; i++) {
            const gid = data[i];
            if (!gid || gid < firstGid) continue;
            const localId = gid - firstGid + 1;
            const col = i % this.mapCols;
            const row = (i / this.mapCols) | 0;
            const imgCol = (localId - 1) % tpr;
            const imgRow = ((localId - 1) / tpr) | 0;

            this.ctx.drawImage(
                img,
                imgCol * this.tileSize, imgRow * this.tileSize,
                this.tileSize, this.tileSize,
                col * this.tileSize, row * this.tileSize,
                this.tileSize, this.tileSize
            );
        }
    }
}