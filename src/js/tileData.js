"use strict";

import * as UTILS from "utils";

const tileData = await UTILS.DOMUtils.createJSON("plantTileset2.json");
const tileTypes = [];

for (let i = 0; i < tileData.tiles.length; i++) {
  tileTypes.push({
    image: await UTILS.DOMUtils.createImage(tileData.tiles[i].dataUrl),
    ...tileData.tiles[i].edges,
  });
}

function getTileTypes() {
  return tileTypes;
}

export { getTileTypes };
