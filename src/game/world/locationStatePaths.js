"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

function requireLocationId(locationId) {
  if (
    typeof locationId !== "string" ||
    locationId.trim() === ""
  ) {
    throw new TypeError(
      "locationId must be a non-empty string."
    );
  }

  const normalisedLocationId =
    locationId.trim();

  if (
    !/^[a-z0-9][a-z0-9_-]*$/.test(
      normalisedLocationId
    )
  ) {
    throw new TypeError(
      "locationId may contain only lowercase letters, numbers, hyphens and underscores."
    );
  }

  return normalisedLocationId;
}

function getLocationStateDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "locations"
  );
}

function getLocationStateFilePath({
  locationId,
  ...worldOptions
} = {}) {
  return path.join(
    getLocationStateDirectory(worldOptions),
    `${requireLocationId(locationId)}.json`
  );
}

module.exports = {
  getLocationStateDirectory,
  getLocationStateFilePath
};