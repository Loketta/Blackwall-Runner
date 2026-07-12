"use strict";

const {
  loadShops,
  saveShops
} = require("../managers/shopManager");
const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

function parseTimeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function getAbsoluteMinutes(day, time) {
  return day * 1440 + parseTimeToMinutes(time);
}

function applyScheduledEventEffect(
  scheduledEvent,
  services = {}
) {
  if (scheduledEvent.type !== "shop_opened") {
    return;
  }

  const loadShopsService =
    services.loadShops ?? loadShops;
  const saveShopsService =
    services.saveShops ?? saveShops;

  const shops = loadShopsService();
  const shop = shops.find(function (candidate) {
    return candidate.id === scheduledEvent.data.shopId;
  });

  if (shop) {
    shop.isOpen = true;
    saveShopsService(shops);
  }
}

function createScheduledDomainEvent(
  world,
  scheduledEvent,
  services = {}
) {
  if (scheduledEvent.type !== "shop_opened") {
    return null;
  }

  const eventRecorder = services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  const shopId = scheduledEvent.data.shopId;

  return eventRecorder.record({
    type: "ShopOpened",
    worldTime: formatWorldTime(world),
    targetIds: [shopId],
    locationId: scheduledEvent.locationId || null,
    payload: {
      shopId
    },
    metadata: {
      source: "scheduledEvents"
    }
  });
}

function processScheduledEvents(world, services = {}) {
  const events = [];

  if (!world.scheduledEvents) {
    world.scheduledEvents = [];
  }

  const currentAbsoluteMinutes = getAbsoluteMinutes(
    world.day,
    world.currentTime
  );

  const remainingEvents = [];

  for (const scheduledEvent of world.scheduledEvents) {
    const eventAbsoluteMinutes = getAbsoluteMinutes(
      scheduledEvent.day,
      scheduledEvent.time
    );

    if (eventAbsoluteMinutes <= currentAbsoluteMinutes) {
      applyScheduledEventEffect(
        scheduledEvent,
        services
      );

      const event = createScheduledDomainEvent(
        world,
        scheduledEvent,
        services
      );

      if (event) {
        events.push(event);
      }
    } else {
      remainingEvents.push(scheduledEvent);
    }
  }

  world.scheduledEvents = remainingEvents;

  return events;
}

module.exports = {
  processScheduledEvents,
  applyScheduledEventEffect,
  createScheduledDomainEvent
};
