"use strict";

const path = require("path");
const { createJsonFileRepository } = require(
  "../repositories/jsonFileRepository"
);
const { PersistentEventStore } = require("./persistentEventStore");
const { EventRecorder } = require("./eventRecorder");
const { EventHistory } = require("./eventHistory");

const eventRepository = createJsonFileRepository({
  filePath: path.join(
    __dirname,
    "../../../data/events/events.json"
  ),
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
