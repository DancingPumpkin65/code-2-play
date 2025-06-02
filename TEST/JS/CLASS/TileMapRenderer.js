class TileMapRenderer {
    constructor({ canvasId, tileSize, mapCols, mapRows, layers }) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.tileSize = tileSize;
        this.mapCols = mapCols;
        this.mapRows = mapRows || (layers[0].data.length / mapCols) | 0;
        this.layers = layers;

        const srcs = [...new Set(layers.map(l => l.tilesetSrc))];
        this.tilesetImages = {};
        let loaded = 0;
        srcs.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                if (++loaded === srcs.length) this.renderAll();
            };
            this.tilesetImages[src] = img;
        });

        this.canvas.width  = this.mapCols * (layers[0].tilewidth || tileSize);
        this.canvas.height = this.mapRows * (layers[0].tileheight || tileSize);
    }

    renderAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => {
            if (layer.collision) return;
            this.renderLayer(layer);
        });
    }

    renderLayer({ data, tilesetSrc, firstGid, columns, tilewidth, tileheight }) {
        const img = this.tilesetImages[tilesetSrc];
        const tpr = columns;
        const tw  = tilewidth;
        const th  = tileheight;

        for (let i = 0; i < data.length; i++) {
            const gid = data[i];
            if (!gid || gid < firstGid) continue;
            const localId = gid - firstGid + 1;
            const col     = i % this.mapCols;
            const row     = (i / this.mapCols) | 0;
            const imgCol  = (localId - 1) % tpr;
            const imgRow  = ((localId - 1) / tpr) | 0;

            this.ctx.drawImage(
                img,
                imgCol * tw, imgRow * th,
                tw, th,
                col  * this.tileSize,
                row  * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }
}