"use strict";

const path = require("path");

const DEFAULT_WORLD_ID = "development-world";

function requireWorldId(worldId) {
  if (
    typeof worldId !== "string" ||
    worldId.trim() === ""
  ) {
    throw new TypeError(
      "worldId must be a non-empty string."
    );
  }

  const normalisedWorldId = worldId.trim();

  if (
    !/^[a-z0-9][a-z0-9_-]*$/.test(
      normalisedWorldId
    )
  ) {
    throw new TypeError(
      "worldId may contain only lowercase letters, numbers, hyphens and underscores."
    );
  }

  return normalisedWorldId;
}

function getWorldDirectory({
  worldId = DEFAULT_WORLD_ID,
  savesDirectory = "saves"
} = {}) {
  const validatedWorldId =
    requireWorldId(worldId);

  if (
    typeof savesDirectory !== "string" ||
    savesDirectory.trim() === ""
  ) {
    throw new TypeError(
      "savesDirectory must be a non-empty string."
    );
  }

  return path.join(
    savesDirectory,
    "worlds",
    validatedWorldId
  );
}

function getWorldStateDirectory(options = {}) {
  return path.join(
    getWorldDirectory(options),
    "state"
  );
}

function getWorldStateFilePath(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "world.json"
  );
}

module.exports = {
  DEFAULT_WORLD_ID,
  getWorldDirectory,
  getWorldStateDirectory,
  getWorldStateFilePath
};
