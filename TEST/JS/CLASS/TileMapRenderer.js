class TileMapRenderer {
    constructor({ canvasId, tileSize, mapCols, mapRows, layers }) {
        this.tileSize = tileSize;
        this.mapCols  = mapCols;
        this.mapRows  = mapRows || (layers[0].data.length / mapCols) | 0;
        this.layers   = layers;

        this.tileCache = {};  
        const srcs = [...new Set(layers.map(l => l.tilesetSrc))];
        let loaded = 0;

        srcs.forEach(src => {
            const meta = layers.find(l => l.tilesetSrc === src);
            const { tilewidth: tw, tileheight: th, columns: tpr } = meta;

            const img = new Image();
            img.src = src;
            img.onload = () => {
                this.tileCache[src] = [];
                const cols = tpr;
                const rows = Math.floor(img.height / th);
                const total = cols * rows;
                for (let id = 1; id <= total; id++) {
                    const c = (id - 1) % cols;
                    const r = ((id - 1) / cols) | 0;
                    const off = document.createElement('canvas');
                    off.width  = tw;
                    off.height = th;
                    off.getContext('2d').drawImage(
                        img,
                        c * tw, r * th, tw, th,
                        0, 0, tw, th
                    );
                    this.tileCache[src][id] = off;
                }
                if (++loaded === srcs.length) this.renderAll();
            };

            this.tilesetImages = this.tilesetImages || {};
            this.tilesetImages[src] = img;
        });

        this.canvas = document.getElementById(canvasId);
        this.ctx    = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.canvas.width  = this.mapCols * tileSize;
        this.canvas.height = this.mapRows * tileSize;
    }

    renderAll() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.layers.forEach(layer => {
            if (layer.collision) return;
            this.renderLayer(layer);
        });
    }

    renderLayer({ data, tilesetSrc, firstGid }) {
        const cache = this.tileCache[tilesetSrc];
        for (let i = 0; i < data.length; i++) {
            const gid = data[i];
            if (!gid || gid < firstGid) continue;
            const localId = gid - firstGid + 1;
            const col     = i % this.mapCols;
            const row     = (i / this.mapCols) | 0;
            const tileCanv = cache[localId];
            this.ctx.drawImage(
                tileCanv,
                col * this.tileSize,
                row * this.tileSize,
                this.tileSize,
                this.tileSize
            );
        }
    }
}