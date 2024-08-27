import * as UTILS from "utils";

const tileTypes = {
    BLANK: 0,
    UP: 1,
    RIGHT: 2,
    DOWN: 3,
    LEFT: 4,
};
const faces = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};
const images = await UTILS.DOMUtils.preloadImages([
    "tile_blank.png",
    "tile_up.png",
    "tile_right.png",
    "tile_down.png",
    "tile_left.png",
], "./src/assets/images/tiles/");
const canvas = new UTILS.canvasUtils.Canvas(UTILS.DOMUtils.query("#canvas"));
canvas.draw.ctx.imageSmoothingEnabled = false;
const size = 10;
const tiles = UTILS.arrayUtils.arrayOf(size * size, () => ({
    collapsed: false,
    options: [tileTypes.BLANK, tileTypes.UP, tileTypes.RIGHT, tileTypes.DOWN, tileTypes.LEFT],
}));
const tileData = [
    [0, 0, 0, 0], // BLANK
    [1, 1, 0, 1], // UP
    [1, 1, 1, 0], // RIGHT
    [0, 1, 1, 1], // DOWN
    [1, 0, 1, 1], // LEFT
];

function getFace(index, face) {
    const faceDataOptions = [];

    tiles[index].options.forEach(option => {
        const faceData = tileData[option][face];

        if (faceDataOptions.includes(faceData)) return;

        faceDataOptions.push(faceData);
    });

    return faceDataOptions;
}



function step() {
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const index = x + y * size;
            const indexes = {
                UP: x + (y - 1) * size,
                RIGHT: x + 1 + y * size,
                DOWN: x + (y + 1) * size,
                LEFT: x - 1 + y * size,
            };

            tiles[index].options = tiles[index].options.filter((tileType) => {
                if (y > 0 && !getFace(indexes.UP, faces.DOWN).includes(tileData[tileType][faces.UP])) return false;
                if (x < size - 1 && !getFace(indexes.RIGHT, faces.LEFT).includes(tileData[tileType][faces.RIGHT])) return false;
                if (y < size - 1 && !getFace(indexes.DOWN, faces.UP).includes(tileData[tileType][faces.DOWN])) return false;
                if (x > 0 && !getFace(indexes.LEFT, faces.RIGHT).includes(tileData[tileType][faces.LEFT])) return false;

                return true;
            });
        }
    }
}

function evaluate() {
    const tilesCopy = tiles.filter(tile => !tile.collapsed);

    if (tilesCopy.length === 0) return true;

    tilesCopy.sort((a, b) => a.options.length - b.options.length);

    const chosenTile = UTILS.arrayUtils.random(tilesCopy.filter(tile => tile.options.length === tilesCopy[0].options.length));

    chosenTile.collapsed = true;
    chosenTile.options = [UTILS.arrayUtils.random(chosenTile.options)];
}

function loop() {
    for (let i = 0; i < 3; i++) step();

    const done = evaluate();

    canvas.draw.clear();
    
    tiles.forEach((tile, index) => {
        if (!tile.collapsed) return;

        const x = index % size;
        const y = Math.floor(index / size);

        canvas.draw.image(images[tile.options[0]], 50 * x, 50 * y, 50, 50);
    });
    
    if (!done) requestAnimationFrame(loop);
}

loop();
