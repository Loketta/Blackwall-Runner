"use strict";

const { DomainEvent } = require("./domainEvent");

class EventStore {
  #events;
  #eventsById;

  constructor() {
    this.#events = [];
    this.#eventsById = new Map();
  }

  append(event) {
    if (!(event instanceof DomainEvent)) {
      throw new TypeError("EventStore can only append DomainEvent instances.");
    }

    if (this.#eventsById.has(event.eventId)) {
      throw new Error(`Event with ID "${event.eventId}" already exists.`);
    }

    this.#events.push(event);
    this.#eventsById.set(event.eventId, event);

    return event;
  }

  getById(eventId) {
    if (typeof eventId !== "string" || eventId.trim() === "") {
      throw new TypeError("eventId must be a non-empty string.");
    }

    return this.#eventsById.get(eventId) ?? null;
  }

  getAll() {
    return Object.freeze([...this.#events]);
  }

  get count() {
    return this.#events.length;
  }
}

module.exports = {
  EventStore
};
