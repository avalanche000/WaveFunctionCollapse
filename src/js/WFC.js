"use strict";

import * as UTILS from "utils";
import Grid from "./Grid.js";

function canConnect(edge1, edge2, rules) {
  return rules.some(
    (rule) =>
      (rule[0] === edge1 && rule[1] === edge2) ||
      (rule[0] === edge2 && rule[1] === edge1)
  );
}

function checkEdge(tileType, other, direction, rules) {
  const oppositeDirection = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  }[direction];

  return (
    other == null ||
    other
      .getAllEdges()
      [oppositeDirection].some((edgeType) =>
        canConnect(tileType.edges[direction], edgeType, rules)
      )
  );
}

function canPlaceTile(tileType, top, bottom, left, right, rules) {
  if (!checkEdge(tileType, top, "top", rules)) return false;
  if (!checkEdge(tileType, bottom, "bottom", rules)) return false;
  if (!checkEdge(tileType, left, "left", rules)) return false;
  if (!checkEdge(tileType, right, "right", rules)) return false;

  return true;
}

function getUncollapsedAround(tiles, exclude = []) {
  const uncollapsed = new Set();

  tiles.forEach((tile) => {
    const top = tile.offset(0, -1);
    const bottom = tile.offset(0, 1);
    const left = tile.offset(-1, 0);
    const right = tile.offset(1, 0);

    if (top != null && !top.collapsed && !exclude.includes(top))
      uncollapsed.add(top);
    if (bottom != null && !bottom.collapsed && !exclude.includes(bottom))
      uncollapsed.add(bottom);
    if (left != null && !left.collapsed && !exclude.includes(left))
      uncollapsed.add(left);
    if (right != null && !right.collapsed && !exclude.includes(right))
      uncollapsed.add(right);
  });

  return [...uncollapsed];
}

function updateTileOptions(tiles, rules) {
  tiles.forEach((tile) => {
    const top = tile.offset(0, -1);
    const bottom = tile.offset(0, 1);
    const left = tile.offset(-1, 0);
    const right = tile.offset(1, 0);

    tile.options = tile.options.filter((tileType) =>
      canPlaceTile(tileType, top, bottom, left, right, rules)
    );
  });
}

class WFC extends UTILS.Observable {
  constructor(width, height, tileData) {
    super("running");

    this.tileData = tileData;
    this.grid = new Grid(width, height, this.tileData.tiles, "wrap");
    this.running = false;
    this.collapseListeners = [];
  }

  onCollapse(cb) {
    this.collapseListeners.push(cb);
  }

  start() {
    if (this.running) {
      this.running = false;
    } else {
      this.running = true;
      this.step();
    }
  }

  step() {
    const collapsed = this.grid.tiles.filter((tile) => tile.collapsed);

    if (collapsed.length === this.grid.tiles.length) {
      console.log("Done");

      this.running = false;
      return;
    }

    let tileToCollapse;

    if (collapsed.length === 0) {
      tileToCollapse = UTILS.arrayUtils.random(this.grid.tiles);

      updateTileOptions([tileToCollapse], this.tileData.rules);
    } else {
      const tilesToCheck = getUncollapsedAround(collapsed);
      const tilesToCheck2 = getUncollapsedAround(tilesToCheck, tilesToCheck);
      // const tilesToCheck3 = getUncollapsedAround(tilesToCheck, [...tilesToCheck, ...tilesToCheck2]);

      updateTileOptions(tilesToCheck, this.tileData.rules);
      updateTileOptions(tilesToCheck2, this.tileData.rules);
      updateTileOptions(tilesToCheck, this.tileData.rules);
      // updateTileOptions(tilesToCheck2, this.tileData.rules);
      // updateTileOptions(tilesToCheck3, this.tileData.rules);
      // updateTileOptions(tilesToCheck2, this.tileData.rules);
      // updateTileOptions(tilesToCheck, this.tileData.rules);

      const minOptions = Math.min(
        ...tilesToCheck.map((tile) => tile.options.length)
      );

      tileToCollapse = UTILS.arrayUtils.random(
        tilesToCheck.filter((tile) => tile.options.length === minOptions)
      );
    }

    tileToCollapse.collapsed = true;

    if (tileToCollapse.options.length > 0) {
      tileToCollapse.options = [
        UTILS.arrayUtils.random(tileToCollapse.options),
      ];
    }

    this.collapseListeners.forEach((cb) => cb(tileToCollapse));

    if (this.running) requestAnimationFrame(() => this.step());
  }

  reset() {
    this.grid.reset();
  }
}

export default WFC;
