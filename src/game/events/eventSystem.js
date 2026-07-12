"use strict";

const {
  processWeatherEvents
} = require("./weatherEvents");
const {
  processRentEvents
} = require("./rentEvents");
const {
  processScheduledEvents
} = require("./scheduledEvents");

const eventProcessors = [
  processWeatherEvents,
  processRentEvents,
  processScheduledEvents
];

function processWorldEvents(world, services = {}) {
  const events = [];

  for (const processEvents of eventProcessors) {
    const newEvents = processEvents(
      world,
      services
    );

    for (const event of newEvents) {
      events.push(event);
    }
  }

  return events;
}

module.exports = {
  processWorldEvents
};
