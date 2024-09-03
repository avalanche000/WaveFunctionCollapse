"use strict";

import * as UTILS from "utils";
import Tile from "./Tile.js";

class Grid {
  constructor(size) {
    this.size = size;
    this.tiles = UTILS.arrayUtils
      .nestedCounter(size, size)
      .map((pos) => new Tile(this, pos[1], pos[0]));
    this.done = false;
  }

  getPos(x, y) {
    if (x < 0) return null;
    if (x > this.size - 1) return null;
    if (y < 0) return null;
    if (y > this.size - 1) return null;

    return this.tiles[x + y * this.size];
  }

  update() {
    const uncollapsedTiles = this.tiles.filter((tile) => !tile.collapsed);

    for (let i = 0; i < 3; i++)
      uncollapsedTiles.forEach((tile) => tile.updateOptions());

    const minOptions = Math.min(
      ...uncollapsedTiles.map((tile) => tile.options.length)
    );
    const activeTile = UTILS.arrayUtils.random(
      uncollapsedTiles.filter((tile) => tile.options.length === minOptions)
    );

    if (activeTile == null) {
      this.done = true;
      console.log("Done");
    } else {
      activeTile.collapsed = true;
      if (activeTile.options.length > 0)
        activeTile.options = [UTILS.arrayUtils.random(activeTile.options)];
    }
  }
}

export default Grid;
