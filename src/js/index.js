"use strict";

import * as UTILS from "utils";
import Grid from "./Grid.js";

const canvas = new UTILS.canvasUtils.Canvas({
  DOMObject: UTILS.DOMUtils.query("#canvas"),
  size: [window.innerWidth, window.innerHeight],
});
canvas.draw.ctx.imageSmoothingEnabled = false;
const grid = new Grid(10);
const scale = 50;

function loop() {
  grid.update();

  canvas.draw.clear();

  grid.tiles.forEach((tile, index) => {
    if (!tile.collapsed) return;

    const x = index % grid.size;
    const y = Math.floor(index / grid.size);

    canvas.draw.image(
      tile.options[0].image,
      scale * x,
      scale * y,
      scale,
      scale
    );
  });

  if (!grid.done) requestAnimationFrame(loop);
  else UTILS.DOMUtils.query("#reset").style.backgroundColor = "white";
}

UTILS.DOMUtils.query("#reset").addEventListener("click", () => {
  UTILS.DOMUtils.query("#reset").style.backgroundColor = "red";

  grid.done = false;
  grid.tiles.forEach((tile) => tile.reset());

  loop();
});
