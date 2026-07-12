"use strict";

const { randomUUID } = require("crypto");
const { DomainEvent } = require("./domainEvent");

class EventRecorder {
  #eventStore;
  #idGenerator;

  constructor({ eventStore, idGenerator = randomUUID }) {
    if (!eventStore || typeof eventStore.append !== "function") {
      throw new TypeError(
        "EventRecorder requires an event store with an append function."
      );
    }

    if (typeof idGenerator !== "function") {
      throw new TypeError("idGenerator must be a function.");
    }

    this.#eventStore = eventStore;
    this.#idGenerator = idGenerator;
  }

  record({
    type,
    worldTime,
    actorId = null,
    targetIds = [],
    locationId = null,
    visibility = "public",
    payload = {},
    parentEventId = null,
    causationId = null,
    metadata = {}
  }) {
    const event = new DomainEvent({
      eventId: this.#idGenerator(),
      type,
      worldTime,
      actorId,
      targetIds,
      locationId,
      visibility,
      payload,
      parentEventId,
      causationId,
      metadata
    });

    return this.#eventStore.append(event);
  }
}

module.exports = {
  EventRecorder
};
