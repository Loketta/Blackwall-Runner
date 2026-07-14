"use strict";

const path = require("path");
const {
  getWorldStateDirectory
} = require("./worldStatePaths");

const DEFAULT_EVENTS_FILE = "events.json";

function requireEventsFile(eventsFile) {
  if (
    typeof eventsFile !== "string" ||
    eventsFile.trim() === ""
  ) {
    throw new TypeError(
      "eventsFile must be a non-empty string."
    );
  }

  const normalisedEventsFile = eventsFile.trim();

  if (
    normalisedEventsFile.includes("/") ||
    normalisedEventsFile.includes("\\") ||
    normalisedEventsFile.includes("..")
  ) {
    throw new TypeError(
      "eventsFile contains invalid path characters."
    );
  }

  return normalisedEventsFile;
}

function getEventsDirectory(options = {}) {
  return path.join(
    getWorldStateDirectory(options),
    "events"
  );
}

function getEventStateFilePath({
  eventsFile = DEFAULT_EVENTS_FILE,
  ...worldOptions
} = {}) {
  return path.join(
    getEventsDirectory(worldOptions),
    requireEventsFile(eventsFile)
  );
}

module.exports = {
  DEFAULT_EVENTS_FILE,
  getEventsDirectory,
  getEventStateFilePath
};