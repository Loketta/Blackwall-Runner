"use strict";

const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

function recordRentDueEvent(
  world,
  services = {}
) {
  const eventRecorder = services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "RentDue",
    worldTime: formatWorldTime(world),
    payload: {
      monthlyCost: world.rent.monthlyCost,
      dueDayOfMonth: world.rent.dueDayOfMonth,
      year: world.calendar.year,
      month: world.calendar.month,
      dayOfMonth: world.calendar.dayOfMonth
    },
    metadata: {
      source: "rentEvents"
    }
  });
}

function processRentEvents(world, services = {}) {
  const events = [];

  if (!world.rent || !world.calendar) {
    return events;
  }

  const rentDueToday =
    world.calendar.dayOfMonth ===
    world.rent.dueDayOfMonth;

  const alreadyChargedThisMonth =
    world.rent.lastChargedYear ===
      world.calendar.year &&
    world.rent.lastChargedMonth ===
      world.calendar.month;

  if (!rentDueToday || alreadyChargedThisMonth) {
    return events;
  }

  world.rent.lastChargedYear =
    world.calendar.year;
  world.rent.lastChargedMonth =
    world.calendar.month;

  const event = recordRentDueEvent(
    world,
    services
  );

  if (event) {
    events.push(event);
  }

  return events;
}

module.exports = {
  processRentEvents,
  recordRentDueEvent
};
