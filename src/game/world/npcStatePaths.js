"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

const DEFAULT_NPCS_FILE = "npcs.json";

function requireNpcsFile(npcsFile) {
  if (
    typeof npcsFile !== "string" ||
    npcsFile.trim() === ""
  ) {
    throw new TypeError(
      "npcsFile must be a non-empty string."
    );
  }

  const normalisedNpcsFile = npcsFile.trim();

  if (
    normalisedNpcsFile.includes("/") ||
    normalisedNpcsFile.includes("\\") ||
    normalisedNpcsFile.includes("..")
  ) {
    throw new TypeError(
      "npcsFile contains invalid path characters."
    );
  }

  return normalisedNpcsFile;
}

function getNpcsDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "npcs"
  );
}

function getNpcStateFilePath({
  npcsFile = DEFAULT_NPCS_FILE,
  ...worldOptions
} = {}) {
  return path.join(
    getNpcsDirectory(worldOptions),
    requireNpcsFile(npcsFile)
  );
}

module.exports = {
  DEFAULT_NPCS_FILE,
  getNpcsDirectory,
  getNpcStateFilePath
};