class TileMapRenderer {
    constructor({ canvasId, tileSize, mapCols, mapRows, layers }) {
        this.tileSize = tileSize;
        this.mapCols  = mapCols;
        this.mapRows  = mapRows || (layers[0].data.length / mapCols) | 0;
        this.layers   = layers;

        this.tileCache = {};
        const srcs = [...new Set(layers.map(l => l.tilesetSrc))];
        let loadedCount = 0;

        // chreg 9te3 mra wa7da
        srcs.forEach(src => {
            const meta = layers.find(l => l.tilesetSrc === src);
            this.loadAndSlice(src, meta).then(() => {
                if (++loadedCount === srcs.length) this.renderAll();
            });
        });

        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.width  = this.mapCols * tileSize;
        this.canvas.height = this.mapRows * tileSize;
    }

    loadAndSlice(src, { tilewidth: tw, tileheight: th, columns: tpr }) {
        return new Promise(resolve => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                const rows = Math.floor(img.height / th);
                const total = tpr * rows;
                this.tileCache[src] = Array(total + 1);
                for (let id = 1; id <= total; id++) {
                    const { col: sxCol, row: sxRow } = this.indexToGrid(id - 1, tpr);
                    const off = document.createElement('canvas');
                    off.width = tw; off.height = th;
                    off.getContext('2d').drawImage(
                        img,
                        sxCol * tw, sxRow * th, tw, th,
                        0, 0, tw, th
                    );
                    this.tileCache[src][id] = off;
                }
                resolve();
            };
        });
    }

    indexToGrid(idx, cols) {
        return { col: idx % cols, row: (idx / cols) | 0 };
    }

    renderAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => {
            if (!layer.collision) this.renderLayer(layer);
        });
    }

    renderLayer({ data, tilesetSrc, firstGrid }) {
        const cache = this.tileCache[tilesetSrc];
        data.forEach((grid, idx) => {
            if (!grid || grid < firstGrid) return;
            const localId = grid - firstGrid + 1;
            const { col, row } = this.indexToGrid(idx, this.mapCols);
            this.ctx.drawImage(
                cache[localId],
                col * this.tileSize, row * this.tileSize,
                this.tileSize, this.tileSize
            );
        });
    }
}