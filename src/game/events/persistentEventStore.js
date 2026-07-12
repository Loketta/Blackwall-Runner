"use strict";

const { DomainEvent } = require("./domainEvent");
const { EventStore } = require("./eventStore");

class PersistentEventStore {
  #repository;
  #store;

  constructor({ repository }) {
    if (
      !repository ||
      typeof repository.load !== "function" ||
      typeof repository.save !== "function"
    ) {
      throw new TypeError(
        "PersistentEventStore requires a repository with load and save functions."
      );
    }

    this.#repository = repository;
    this.#store = new EventStore();

    this.#loadPersistedEvents();
  }

  append(event) {
    this.#store.append(event);

    try {
      this.#repository.save(this.#store.getAll());
    } catch (error) {
      this.#store = this.#createStoreWithout(event.eventId);
      throw error;
    }

    return event;
  }

  getById(eventId) {
    return this.#store.getById(eventId);
  }

  getAll() {
    return this.#store.getAll();
  }

  get count() {
    return this.#store.count;
  }

  #loadPersistedEvents() {
    const records = this.#repository.load();

    if (!Array.isArray(records)) {
      throw new TypeError("Persisted event data must be an array.");
    }

    for (const record of records) {
      this.#store.append(new DomainEvent(record));
    }
  }

  #createStoreWithout(excludedEventId) {
    const replacementStore = new EventStore();

    for (const storedEvent of this.#store.getAll()) {
      if (storedEvent.eventId !== excludedEventId) {
        replacementStore.append(storedEvent);
      }
    }

    return replacementStore;
  }
}

module.exports = {
  PersistentEventStore
};
