"use strict";

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }
}

class EventHistory {
  #eventStore;

  constructor({ eventStore }) {
    if (
      !eventStore ||
      typeof eventStore.getAll !== "function"
    ) {
      throw new TypeError(
        "EventHistory requires an event store with a getAll function."
      );
    }

    this.#eventStore = eventStore;
  }

  getAll() {
    return this.#eventStore.getAll();
  }

  getByType(type) {
    requireNonEmptyString(type, "type");

    return Object.freeze(
      this.getAll().filter((event) => {
        return event.type === type;
      })
    );
  }

  getByActor(actorId) {
    requireNonEmptyString(actorId, "actorId");

    return Object.freeze(
      this.getAll().filter((event) => {
        return event.actorId === actorId;
      })
    );
  }

  getByTarget(targetId) {
    requireNonEmptyString(targetId, "targetId");

    return Object.freeze(
      this.getAll().filter((event) => {
        return event.targetIds.includes(targetId);
      })
    );
  }

  getByLocation(locationId) {
    requireNonEmptyString(locationId, "locationId");

    return Object.freeze(
      this.getAll().filter((event) => {
        return event.locationId === locationId;
      })
    );
  }

  getBetween(startWorldTime, endWorldTime) {
    requireNonEmptyString(
      startWorldTime,
      "startWorldTime"
    );
    requireNonEmptyString(
      endWorldTime,
      "endWorldTime"
    );

    if (startWorldTime > endWorldTime) {
      throw new RangeError(
        "startWorldTime must not be later than endWorldTime."
      );
    }

    return Object.freeze(
      this.getAll().filter((event) => {
        return (
          event.worldTime >= startWorldTime &&
          event.worldTime <= endWorldTime
        );
      })
    );
  }

  getRecent(limit) {
    if (!Number.isInteger(limit) || limit < 0) {
      throw new TypeError(
        "limit must be a non-negative integer."
      );
    }

    if (limit === 0) {
      return Object.freeze([]);
    }

    return Object.freeze(
      this.getAll().slice(-limit)
    );
  }
}

module.exports = {
  EventHistory
};
