"use strict";

import * as UTILS from "utils";
import TileType from "./TileType.js";

const preload = UTILS.DOMUtils.preloadImage;

const tileBlank = new TileType(
  await preload("tiles/tile_blank.png"),
  [0, 0, 0, 0]
);
const tile4Way = new TileType(
  await preload("tiles/tile_4way.png"),
  [1, 1, 1, 1]
);
const tileHorizontal = new TileType(
  await preload("tiles/tile_horizontal.png"),
  [0, 1, 0, 1]
);
const tile3WayUp = new TileType(
  await preload("tiles/tile_3way_up.png"),
  [1, 1, 0, 1]
);
const tileCornerUp = new TileType(
  await preload("tiles/tile_corner_up.png"),
  [1, 1, 0, 0]
);
const tile1WayUp = new TileType(
  await preload("tiles/tile_1way_up.png"),
  [1, 0, 0, 0]
);

const tileTypes = [
  tileBlank,
  // tile4Way,
  tileHorizontal,
  tileHorizontal.rotate(1),
  tile3WayUp,
  tile3WayUp.rotate(1),
  tile3WayUp.rotate(2),
  tile3WayUp.rotate(3),
  // tileCornerUp,
  // tileCornerUp.rotate(1),
  // tileCornerUp.rotate(2),
  // tileCornerUp.rotate(3),
  // tile1WayUp,
  // tile1WayUp.rotate(1),
  // tile1WayUp.rotate(2),
  // tile1WayUp.rotate(3),
];
const rules = [
  [0, 0],
  [1, 1],
];

function matchesRule(endType, matchTypes) {
  for (let i = 0; i < rules.length; i++) {
    for (let j = 0; j < matchTypes.length; j++) {
      const normal = [endType, matchTypes[j]];
      const reversed = [matchTypes[j], endType];

      if (rules[i].toString() === normal.toString()) return true;
      if (rules[i].toString() === reversed.toString()) return true;
    }
  }

  return false;
}

class Tile {
  constructor(grid, x, y) {
    this.grid = grid;
    this.x = x;
    this.y = y;
    this.collapsed = false;
    this.options = [...tileTypes];
  }

  reset() {
    this.collapsed = false;
    this.options = [...tileTypes];
  }

  cell(dx, dy) {
    return this.grid.getPos(this.x + dx, this.y + dy);
  }

  getAllOptionsFace(face) {
    return [...new Set(this.options.map((option) => option[face]))];
  }

  updateOptions() {
    const top = this.cell(0, -1);
    const bottom = this.cell(0, 1);
    const left = this.cell(-1, 0);
    const right = this.cell(1, 0);

    this.options = this.options.filter((option) => {
      if (top && !matchesRule(option.top, top.getAllOptionsFace("bottom")))
        return false;
      if (
        bottom &&
        !matchesRule(option.bottom, bottom.getAllOptionsFace("top"))
      )
        return false;
      if (left && !matchesRule(option.left, left.getAllOptionsFace("right")))
        return false;
      if (right && !matchesRule(option.right, right.getAllOptionsFace("left")))
        return false;

      return true;
    });
  }
}

export default Tile;
