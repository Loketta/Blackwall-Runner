"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

const DEFAULT_PLAYER_FILE = "runner.json";

function requirePlayerFile(playerFile) {
  if (
    typeof playerFile !== "string" ||
    playerFile.trim() === ""
  ) {
    throw new TypeError(
      "playerFile must be a non-empty string."
    );
  }

  const normalisedPlayerFile = playerFile.trim();

  if (
    normalisedPlayerFile.includes("/") ||
    normalisedPlayerFile.includes("\\") ||
    normalisedPlayerFile.includes("..")
  ) {
    throw new TypeError(
      "playerFile contains invalid path characters."
    );
  }

  return normalisedPlayerFile;
}

function getPlayersDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "players"
  );
}

function getPlayerStateFilePath({
  playerFile = DEFAULT_PLAYER_FILE,
  ...worldOptions
} = {}) {
  return path.join(
    getPlayersDirectory(worldOptions),
    requirePlayerFile(playerFile)
  );
}

module.exports = {
  DEFAULT_PLAYER_FILE,
  getPlayersDirectory,
  getPlayerStateFilePath
};
