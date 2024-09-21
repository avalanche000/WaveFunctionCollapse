"use strict";

import * as UTILS from "utils";

const query = UTILS.DOMUtils.query;
const canvas = query("#tileCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

let tiles = [];
let rules = [];
let currentTileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
let isDrawing = false;
let isErasing = false;
let inside = false;
let selectedColor = "#000000";

ctx.imageSmoothingEnabled = true;

query("#colorPicker").addEventListener("input", (event) => {
  selectedColor = event.target.value;
});

canvas.addEventListener("mousedown", (event) => {
  event.preventDefault();

  switch (event.button) {
    case 0:
      isDrawing = true;
      drawOnCanvas(event);
      break;
    case 1:
      selectFromCanvas(event);
      break;
    case 2:
      isErasing = true;
      eraseOnCanvas(event);
      break;
  }
});

window.addEventListener("mouseup", () => {
  isDrawing = false;
  isErasing = false;
});

canvas.addEventListener("mouseenter", () => {
  inside = true;
});

canvas.addEventListener("mouseleave", () => {
  inside = false;
});

canvas.addEventListener("mousemove", (event) => {
  if (inside && isDrawing) drawOnCanvas(event);
  if (inside && isErasing) eraseOnCanvas(event);
});

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function selectFromCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;
  const index =
    (Math.floor((x * canvas.width) / canvas.clientWidth) +
      Math.floor((y * canvas.height) / canvas.clientHeight) * canvas.width) *
    4;
  const hexColor = rgbToHex(
    currentTileData.data[index],
    currentTileData.data[index + 1],
    currentTileData.data[index + 2]
  );

  query("#colorPicker").value = hexColor;
  selectedColor = hexColor;
}

function drawOnCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.fillStyle = selectedColor;
  ctx.fillRect(
    Math.floor((x * canvas.width) / canvas.clientWidth),
    Math.floor((y * canvas.height) / canvas.clientHeight),
    1,
    1
  );

  currentTileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function eraseOnCanvas(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  ctx.clearRect(
    Math.floor((x * canvas.width) / canvas.clientWidth),
    Math.floor((y * canvas.height) / canvas.clientHeight),
    1,
    1
  );

  currentTileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener("contextmenu", (event) => {
  event.preventDefault();
});

query("#clearCanvas").addEventListener("click", () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  currentTileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
});

query("#saveTile").addEventListener("click", () => {
  const tile = {
    imageData: currentTileData,
    edges: {
      top: query("#topEdge").value,
      bottom: query("#bottomEdge").value,
      left: query("#leftEdge").value,
      right: query("#rightEdge").value,
    },
    rotations: parseInt(query('input[name="rotation"]:checked').value),
  };

  tiles.push(tile);

  addTileToSidebar(tile);
});

function addTileToSidebar(tile) {
  const sidebar = query("#tilesSidebar");
  const tileContainer = document.createElement("div");
  const previewCanvas = document.createElement("canvas");
  const previewCtx = previewCanvas.getContext("2d");
  const deleteButton = document.createElement("button");

  tileContainer.classList.add("tile-container");

  previewCanvas.width = tile.imageData.width;
  previewCanvas.height = tile.imageData.height;
  previewCanvas.classList.add("tile-background");
  previewCanvas.addEventListener("click", () => editTile(tile));

  previewCtx.imageSmoothingEnabled = false;
  previewCtx.putImageData(tile.imageData, 0, 0);

  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-tile-button");

  deleteButton.addEventListener("click", () => {
    const index = tiles.indexOf(tile);

    if (index > -1) tiles.splice(index, 1);
    sidebar.removeChild(tileContainer);
  });

  tileContainer.appendChild(previewCanvas);
  tileContainer.appendChild(deleteButton);

  sidebar.appendChild(tileContainer);
}

function editTile(tile) {
  currentTileData = tile.imageData;

  ctx.putImageData(tile.imageData, 0, 0);

  query("#topEdge").value = tile.edges.top;
  query("#bottomEdge").value = tile.edges.bottom;
  query("#leftEdge").value = tile.edges.left;
  query("#rightEdge").value = tile.edges.right;
  query(`input[name="rotation"][value="${tile.rotations}"]`).checked = true;
}

query("#exportTiles").addEventListener("click", () => {
  const tileData = [];

  tiles.forEach((tile) => {
    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;

    UTILS.arrayUtils.range(tile.rotations).forEach((rotation) => {
      const rotatedImageData = new ImageData(
        tile.imageData.width,
        tile.imageData.height
      );

      for (let i = 0; i < tile.imageData.width * tile.imageData.height; i++) {
        const x = i % tile.imageData.width;
        const y = Math.floor(i / tile.imageData.width);
        const index = (x + y * tile.imageData.width) * 4;

        const [rotX, rotY] = getRotatedPos(x, y, rotation, tile.imageData.width);
        const rotIndex = (rotX + rotY * tile.imageData.width) * 4;

        rotatedImageData.data[index] = tile.imageData.data[rotIndex];
        rotatedImageData.data[index + 1] = tile.imageData.data[rotIndex + 1];
        rotatedImageData.data[index + 2] = tile.imageData.data[rotIndex + 2];
        rotatedImageData.data[index + 3] = tile.imageData.data[rotIndex + 3];
      }

      tempCtx.putImageData(rotatedImageData, 0, 0);

      tileData.push({
        edges: getRotatedEdges(tile.edges, rotation),
        dataUrl: tempCanvas.toDataURL(),
      });
    });
  });

  const json = JSON.stringify(
    {
      tiles: tileData,
      rules,
    },
    null,
    2
  );
  console.log(json);

  navigator.clipboard
    .writeText(json)
    .then(() => alert("Tile data copied to clipboard!"))
    .catch((err) => console.error("Could not copy text: ", err));
});

query("#importTiles").addEventListener("click", async () => {
  const sidebar = query("#tilesSidebar");
  const importedData = JSON.parse(prompt());

  if (importedData?.tiles == null) return;

  sidebar.innerHTML = "";
  tiles = [];

  for (let i = 0; i < importedData.tiles.length; i++) {
    const tile = {
      imageData: await createImageDataFromUrl(importedData.tiles[i].dataUrl),
      edges: importedData.tiles[i].edges,
      rotations: 1,
    };

    tiles.push(tile);
    addTileToSidebar(tile);
  }

  rules = importedData.rules;
});

// rotation clockwise
function getRotatedPos(x, y, rotation, size) {
  return [
    [x, y],
    [y, size - 1 - x],
    [size - 1 - x, size - 1 - y],
    [size - 1 - y, x],
  ][rotation];
}

function getRotatedEdges(edges, rotation) {
  const rotatedEdgesArray = UTILS.arrayUtils.cycle(
    [edges.top, edges.right, edges.bottom, edges.left],
    -rotation
  );

  return {
    top: rotatedEdgesArray[0],
    right: rotatedEdgesArray[1],
    bottom: rotatedEdgesArray[2],
    left: rotatedEdgesArray[3],
  };
}

function createImageDataFromUrl(dataUrl) {
  const img = new Image();
  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  return new Promise((resolve) => {
    img.addEventListener("load", () => {
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;

      tempCtx.drawImage(img, 0, 0);

      resolve(tempCtx.getImageData(0, 0, img.width, img.height));
    });

    img.src = dataUrl;
  });
}
