"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

const DEFAULT_WORLD_OBJECTS_FILE =
  "worldObjects.json";

function requireWorldObjectsFile(worldObjectsFile) {
  if (
    typeof worldObjectsFile !== "string" ||
    worldObjectsFile.trim() === ""
  ) {
    throw new TypeError(
      "worldObjectsFile must be a non-empty string."
    );
  }

  const normalisedWorldObjectsFile =
    worldObjectsFile.trim();

  if (
    normalisedWorldObjectsFile.includes("/") ||
    normalisedWorldObjectsFile.includes("\\") ||
    normalisedWorldObjectsFile.includes("..")
  ) {
    throw new TypeError(
      "worldObjectsFile contains invalid path characters."
    );
  }

  return normalisedWorldObjectsFile;
}

function getWorldObjectsDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "worldObjects"
  );
}

function getWorldObjectStateFilePath({
  worldObjectsFile = DEFAULT_WORLD_OBJECTS_FILE,
  ...worldOptions
} = {}) {
  return path.join(
    getWorldObjectsDirectory(worldOptions),
    requireWorldObjectsFile(worldObjectsFile)
  );
}

module.exports = {
  DEFAULT_WORLD_OBJECTS_FILE,
  getWorldObjectsDirectory,
  getWorldObjectStateFilePath
};