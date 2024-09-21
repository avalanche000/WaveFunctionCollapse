"use strict";

function canConnect(edge1, edge2) {
  return rules.some(
    (rule) =>
      (rule[0] === edge1 && rule[1] === edge2) ||
      (rule[0] === edge2 && rule[1] === edge1)
  );
}

function canPlaceTile(tile1, tile2, direction) {
  switch (direction) {
    case "top":
      return canConnect(tile1.edges.bottom, tile2.edges.top);
    case "bottom":
      return canConnect(tile1.edges.top, tile2.edges.bottom);
    case "left":
      return canConnect(tile1.edges.right, tile2.edges.left);
    case "right":
      return canConnect(tile1.edges.left, tile2.edges.right);
  }
}

class Tile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.collapsed = false;
    this.top = null;
    this.bottom = null;
    this.left = null;
    this.right = null;
    this.image = null;
  }
}

export default Tile;
