"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

const DEFAULT_SHOPS_FILE = "shops.json";

function requireShopsFile(shopsFile) {
  if (
    typeof shopsFile !== "string" ||
    shopsFile.trim() === ""
  ) {
    throw new TypeError(
      "shopsFile must be a non-empty string."
    );
  }

  const normalisedShopsFile = shopsFile.trim();

  if (
    normalisedShopsFile.includes("/") ||
    normalisedShopsFile.includes("\\") ||
    normalisedShopsFile.includes("..")
  ) {
    throw new TypeError(
      "shopsFile contains invalid path characters."
    );
  }

  return normalisedShopsFile;
}

function getShopsDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "shops"
  );
}

function getShopStateFilePath({
  shopsFile = DEFAULT_SHOPS_FILE,
  ...worldOptions
} = {}) {
  return path.join(
    getShopsDirectory(worldOptions),
    requireShopsFile(shopsFile)
  );
}

module.exports = {
  DEFAULT_SHOPS_FILE,
  getShopsDirectory,
  getShopStateFilePath
};