"use strict";

import * as UTILS from "utils";

class TileType {
  constructor(image, edges) {
    this.image = image;
    this.canvas = new UTILS.canvasUtils.Canvas({
      size: [this.image.width, this.image.height],
    });
    this.edges = edges; // ordered [top, right, bottom, left]
    [this.top, this.right, this.bottom, this.left] = this.edges;
  }

  rotate(num) {
    this.canvas.draw.clear();
    this.canvas.draw.useRotated(Math.PI / 2 * num, this.canvas.rect.getAnchor([0.5, 0.5]), (draw) => {
      draw.image(this.image, 0, 0);
    });

    const newImage = new Image();

    newImage.src = this.canvas.DOMObject.toDataURL();

    return new TileType(newImage, UTILS.arrayUtils.cycle(this.edges, -num));
  }
}

export default TileType;
