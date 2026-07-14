"use strict";

const fs = require("fs");
const path = require("path");
const { createJsonFileRepository } = require(
  "../repositories/jsonFileRepository"
);
const {
  getEventStateFilePath
} = require("../world/eventStatePaths");
const { PersistentEventStore } = require("./persistentEventStore");
const { EventRecorder } = require("./eventRecorder");
const { EventHistory } = require("./eventHistory");

const defaultSavesDirectory = path.resolve(
  __dirname,
  "../../../saves"
);

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ||
  defaultSavesDirectory;

const eventStatePath = getEventStateFilePath({
  savesDirectory
});

const eventTemplatePath = path.resolve(
  __dirname,
  "../../../data/events/events.json"
);

function seedEventStateIfMissing() {
  if (fs.existsSync(eventStatePath)) {
    return;
  }

  fs.mkdirSync(
    path.dirname(eventStatePath),
    { recursive: true }
  );

  fs.copyFileSync(
    eventTemplatePath,
    eventStatePath
  );
}

seedEventStateIfMissing();

const eventRepository = createJsonFileRepository({
  filePath: eventStatePath,
  indentation: 2
});

const eventStore = new PersistentEventStore({
  repository: eventRepository
});

const eventRecorder = new EventRecorder({
  eventStore
});

const eventHistory = new EventHistory({
  eventStore
});

const eventServices = Object.freeze({
  eventRecorder,
  eventHistory
});

function getEventServices() {
  return eventServices;
}

module.exports = {
  getEventServices
};