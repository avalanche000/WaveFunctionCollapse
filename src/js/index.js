"use strict";

import * as UTILS from "utils";
import WFC from "./WFC.js";

const startBtn = UTILS.DOMUtils.query("#start");
const stepBtn = UTILS.DOMUtils.query("#step");
const resetBtn = UTILS.DOMUtils.query("#reset");
const width = 21;
const height = 21;
const scale = 8;
const canvas = new UTILS.canvasUtils.Canvas({
  DOMObject: UTILS.DOMUtils.query("#canvas"),
  size: [width * 8, height * 8],
});
const sim = new WFC(width, height, await loadTileData("plant4-no-ground.json"));

async function loadTileData(file) {
  const tileData = await UTILS.DOMUtils.createJSON(file);

  for (const tile of tileData.tiles) {
    tile.image = await UTILS.DOMUtils.createImage(tile.dataUrl);
  }

  return tileData;
}

canvas.draw.ctx.imageSmoothingEnabled = false;

startBtn.addEventListener("click", () => sim.start());
stepBtn.addEventListener("click", () => sim.step());
resetBtn.addEventListener("click", () => {
  sim.reset();
  drawTiles();
});

function drawTiles() {
  canvas.draw.clear();

  sim.grid.tiles.forEach((tile) => {
    if (tile.collapsed) {
      if (tile.options.length === 0) {
        canvas.draw.rect("red", [tile.x * 8, tile.y * 8, 8, 8]);
      } else {
        canvas.draw.image(tile.options[0].image, tile.x * 8, tile.y * 8);
      }
    } else {
      canvas.draw.circle("white", [tile.x * 8 + 4, tile.y * 8 + 4], 1);
    }
  });
}

sim.subscribe("running", (running) => {
  if (running) {
    startBtn.innerHTML = "Pause";
    startBtn.className = "shiny";
  } else {
    startBtn.innerHTML = "Start";
    startBtn.className = "";
  }
});
sim.onCollapse((tile) => drawTiles());

canvas.DOMObject.addEventListener("contextmenu", (event) =>
  event.preventDefault()
);
canvas.DOMObject.addEventListener("mousedown", (event) => {
  event.preventDefault();

  const rect = event.target.getBoundingClientRect();
  const x = Math.floor(
    ((event.clientX - rect.left) * canvas.DOMObject.width) /
      8 /
      canvas.DOMObject.clientWidth
  );
  const y = Math.floor(
    ((event.clientY - rect.top) * canvas.DOMObject.height) /
      8 /
      canvas.DOMObject.clientHeight
  );
  const tile = sim.grid.tiles.find((tile) => tile.x === x && tile.y === y);

  if (tile == null) return;

  switch (event.button) {
    case 0:
      tile.options = [
        sim.grid.defaultTileTypes[
          tile.collapsed
            ? (sim.grid.defaultTileTypes.indexOf(tile.options[0]) + 1) %
              sim.grid.defaultTileTypes.length
            : 0
        ],
      ];
      tile.collapsed = true;
      break;
    case 2:
      tile.collapsed = false;
      tile.options = sim.grid.defaultTileTypes;
      break;
  }

  drawTiles();
});

drawTiles();
