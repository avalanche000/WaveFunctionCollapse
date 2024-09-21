"use strict";

import * as UTILS from "utils";

class Grid {
  constructor(width, height, defaultTileTypes, endBehavior = "stop") {
    this.defaultTileTypes = defaultTileTypes;
    this.endBehavior = endBehavior;
    this.width = width;
    this.height = height;
    this.tiles = UTILS.arrayUtils.nestedCounter(height, width).map((pos) => {
      const tile = {
        collapsed: false,
        x: pos[1],
        y: pos[0],
        options: this.defaultTileTypes,
        offset: (dx, dy) => this.getTile(pos[1] + dx, pos[0] + dy),
        getAllEdges: () => {
          const [top, bottom, left, right] = [
            new Set(),
            new Set(),
            new Set(),
            new Set(),
          ];

          tile.options.forEach((option) => {
            top.add(option.edges.top);
            bottom.add(option.edges.bottom);
            left.add(option.edges.left);
            right.add(option.edges.right);
          });

          return {
            top: [...top],
            bottom: [...bottom],
            left: [...left],
            right: [...right],
          };
        },
      };

      return tile;
    });
  }

  reset() {
    this.tiles.forEach((tile) => {
      tile.collapsed = false;
      tile.options = this.defaultTileTypes;
    });
  }

  getTile(x, y) {
    if (x < 0 || x > this.width - 1 || y < 0 || y > this.height - 1) {
      switch (this.endBehavior) {
        case "stop":
          return null;
        case "wrap":
          x = UTILS.numberUtils.wrap(0, this.width, x);
          y = UTILS.numberUtils.wrap(0, this.height, y);
          break;
        case "wrapX":
          if (y < 0 || y > this.height - 1) return null;
          x = UTILS.numberUtils.wrap(0, this.width, x);
          break;
        case "wrapY":
          if (x < 0 || x > this.width - 1) return null;
          y = UTILS.numberUtils.wrap(0, this.height, y);
          break;
        default:
          console.error("Bad end behavior type " + this.endBehavior);
          return null;
      }
    }

    return this.tiles[x + y * this.width];
  }
}

export default Grid;
