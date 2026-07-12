"use strict";

const assert = require("assert");
const { DomainEvent } = require("../../src/game/events/domainEvent");
const { PersistentEventStore } = require(
  "../../src/game/events/persistentEventStore"
);

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

function createEvent(eventId, overrides = {}) {
  return new DomainEvent({
    eventId,
    type: "CharacterTravelled",
    worldTime: "2045-07-12T14:30:00",
    actorId: "player_1",
    targetIds: ["safehouse_1"],
    locationId: "safehouse_1",
    payload: {
      originId: "back_alley_1",
      destinationId: "safehouse_1"
    },
    ...overrides
  });
}

function createRepository(initialValue = []) {
  let storedValue = initialValue;
  let saveCount = 0;

  return {
    load() {
      return storedValue;
    },

    save(value) {
      storedValue = value;
      saveCount += 1;
      return value;
    },

    getStoredValue() {
      return storedValue;
    },

    getSaveCount() {
      return saveCount;
    }
  };
}

console.log("================================");
console.log("PERSISTENT EVENT STORE TESTS");
console.log("================================");
console.log("");

test("Starts empty when persistence contains no events", () => {
  const store = new PersistentEventStore({
    repository: createRepository()
  });

  assert.strictEqual(store.count, 0);
  assert.deepStrictEqual(store.getAll(), []);
});

test("Loads and rehydrates persisted event records", () => {
  const repository = createRepository([
    {
      eventId: "event_1",
      type: "CharacterTravelled",
      worldTime: "2045-07-12T14:30:00",
      actorId: "player_1",
      targetIds: ["safehouse_1"],
      locationId: "safehouse_1",
      payload: { originId: "back_alley_1" }
    }
  ]);

  const store = new PersistentEventStore({ repository });
  const event = store.getById("event_1");

  assert.strictEqual(store.count, 1);
  assert.strictEqual(event instanceof DomainEvent, true);
  assert.strictEqual(Object.isFrozen(event), true);
  assert.strictEqual(event.actorId, "player_1");
});

test("Preserves persisted event order", () => {
  const repository = createRepository([
    {
      eventId: "event_1",
      type: "FirstEvent",
      worldTime: "2045-07-12T14:30:00"
    },
    {
      eventId: "event_2",
      type: "SecondEvent",
      worldTime: "2045-07-12T14:31:00"
    }
  ]);

  const store = new PersistentEventStore({ repository });

  assert.deepStrictEqual(
    store.getAll().map((event) => event.eventId),
    ["event_1", "event_2"]
  );
});

test("Persists the complete history after append", () => {
  const repository = createRepository();
  const store = new PersistentEventStore({ repository });

  store.append(createEvent("event_1"));
  store.append(createEvent("event_2"));

  assert.strictEqual(repository.getSaveCount(), 2);
  assert.deepStrictEqual(
    repository.getStoredValue().map((event) => event.eventId),
    ["event_1", "event_2"]
  );
});

test("Returns the appended event", () => {
  const store = new PersistentEventStore({
    repository: createRepository()
  });
  const event = createEvent("event_1");

  assert.strictEqual(store.append(event), event);
});

test("Rejects duplicate persisted identifiers", () => {
  const repository = createRepository([
    {
      eventId: "event_1",
      type: "FirstEvent",
      worldTime: "2045-07-12T14:30:00"
    },
    {
      eventId: "event_1",
      type: "SecondEvent",
      worldTime: "2045-07-12T14:31:00"
    }
  ]);

  assert.throws(
    () => new PersistentEventStore({ repository }),
    /Event with ID "event_1" already exists/
  );
});

test("Rejects persistence data that is not an array", () => {
  assert.throws(
    () => new PersistentEventStore({
      repository: createRepository({ events: [] })
    }),
    /Persisted event data must be an array/
  );
});

test("Rejects an invalid repository", () => {
  assert.throws(
    () => new PersistentEventStore({ repository: {} }),
    /requires a repository with load and save functions/
  );
});

test("Rolls back memory when persistence fails", () => {
  const repository = {
    load() {
      return [];
    },

    save() {
      throw new Error("Persistence failed.");
    }
  };

  const store = new PersistentEventStore({ repository });

  assert.throws(
    () => store.append(createEvent("event_1")),
    /Persistence failed/
  );
  assert.strictEqual(store.count, 0);
  assert.strictEqual(store.getById("event_1"), null);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
