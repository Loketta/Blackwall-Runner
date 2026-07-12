"use strict";

const assert = require("assert");
const { DomainEvent } = require("../../src/game/events/domainEvent");
const { EventStore } = require("../../src/game/events/eventStore");
const { EventRecorder } = require("../../src/game/events/eventRecorder");

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

function createRecorder(overrides = {}) {
  const eventStore = overrides.eventStore ?? new EventStore();
  const idGenerator = overrides.idGenerator ?? (() => "event_1");

  return {
    eventStore,
    recorder: new EventRecorder({ eventStore, idGenerator })
  };
}

function recordTravelEvent(recorder, overrides = {}) {
  return recorder.record({
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

console.log("================================");
console.log("EVENT RECORDER TESTS");
console.log("================================");
console.log("");

test("Creates and appends a domain event", () => {
  const { recorder, eventStore } = createRecorder();

  const event = recordTravelEvent(recorder);

  assert.strictEqual(event instanceof DomainEvent, true);
  assert.strictEqual(eventStore.count, 1);
  assert.strictEqual(eventStore.getById("event_1"), event);
});

test("Uses the injected identifier generator", () => {
  const { recorder } = createRecorder({
    idGenerator: () => "generated_event_id"
  });

  const event = recordTravelEvent(recorder);

  assert.strictEqual(event.eventId, "generated_event_id");
});

test("Records all supplied event fields", () => {
  const { recorder } = createRecorder();

  const event = recordTravelEvent(recorder, {
    visibility: "hidden",
    parentEventId: "event_parent",
    causationId: "action_1",
    metadata: { source: "waitAction" }
  });

  assert.strictEqual(event.type, "CharacterTravelled");
  assert.strictEqual(event.worldTime, "2045-07-12T14:30:00");
  assert.strictEqual(event.actorId, "player_1");
  assert.deepStrictEqual(event.targetIds, ["safehouse_1"]);
  assert.strictEqual(event.locationId, "safehouse_1");
  assert.strictEqual(event.visibility, "hidden");
  assert.strictEqual(event.parentEventId, "event_parent");
  assert.strictEqual(event.causationId, "action_1");
  assert.deepStrictEqual(event.metadata, { source: "waitAction" });
});

test("Uses domain event defaults for optional fields", () => {
  const { recorder } = createRecorder();

  const event = recorder.record({
    type: "TimePassed",
    worldTime: "2045-07-12T15:00:00"
  });

  assert.strictEqual(event.actorId, null);
  assert.deepStrictEqual(event.targetIds, []);
  assert.strictEqual(event.locationId, null);
  assert.strictEqual(event.visibility, "public");
  assert.deepStrictEqual(event.payload, {});
});

test("Returns the value returned by the event store", () => {
  const storedValue = { stored: true };
  const eventStore = {
    append() {
      return storedValue;
    }
  };
  const recorder = new EventRecorder({
    eventStore,
    idGenerator: () => "event_1"
  });

  const result = recorder.record({
    type: "TimePassed",
    worldTime: "2045-07-12T15:00:00"
  });

  assert.strictEqual(result, storedValue);
});

test("Propagates event store failures", () => {
  const eventStore = {
    append() {
      throw new Error("Store failed.");
    }
  };
  const recorder = new EventRecorder({
    eventStore,
    idGenerator: () => "event_1"
  });

  assert.throws(
    () => recorder.record({
      type: "TimePassed",
      worldTime: "2045-07-12T15:00:00"
    }),
    /Store failed/
  );
});

test("Rejects an invalid event store", () => {
  assert.throws(
    () => new EventRecorder({ eventStore: {} }),
    /requires an event store with an append function/
  );
});

test("Rejects an invalid identifier generator", () => {
  assert.throws(
    () => new EventRecorder({
      eventStore: new EventStore(),
      idGenerator: "not a function"
    }),
    /idGenerator must be a function/
  );
});

test("Uses DomainEvent validation for recorded data", () => {
  const { recorder, eventStore } = createRecorder();

  assert.throws(
    () => recorder.record({
      type: "",
      worldTime: "2045-07-12T15:00:00"
    }),
    /type must be a non-empty string/
  );

  assert.strictEqual(eventStore.count, 0);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
