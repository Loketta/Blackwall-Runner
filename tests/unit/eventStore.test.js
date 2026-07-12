"use strict";

const assert = require("assert");
const { DomainEvent } = require("../../src/game/events/domainEvent");
const { EventStore } = require("../../src/game/events/eventStore");

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

console.log("================================");
console.log("EVENT STORE TESTS");
console.log("================================");
console.log("");

test("Starts empty", () => {
  const store = new EventStore();

  assert.strictEqual(store.count, 0);
  assert.deepStrictEqual(store.getAll(), []);
});

test("Appends and returns a domain event", () => {
  const store = new EventStore();
  const event = createEvent("event_1");

  const appendedEvent = store.append(event);

  assert.strictEqual(appendedEvent, event);
  assert.strictEqual(store.count, 1);
});

test("Preserves event insertion order", () => {
  const store = new EventStore();
  const firstEvent = createEvent("event_1");
  const secondEvent = createEvent("event_2");

  store.append(firstEvent);
  store.append(secondEvent);

  assert.deepStrictEqual(store.getAll(), [firstEvent, secondEvent]);
});

test("Retrieves an event by identifier", () => {
  const store = new EventStore();
  const event = createEvent("event_1");

  store.append(event);

  assert.strictEqual(store.getById("event_1"), event);
  assert.strictEqual(store.getById("event_missing"), null);
});

test("Rejects values that are not domain events", () => {
  const store = new EventStore();

  assert.throws(
    () => store.append({ eventId: "event_1" }),
    /EventStore can only append DomainEvent instances/
  );
});

test("Rejects duplicate event identifiers", () => {
  const store = new EventStore();

  store.append(createEvent("event_1"));

  assert.throws(
    () => store.append(createEvent("event_1")),
    /Event with ID "event_1" already exists/
  );

  assert.strictEqual(store.count, 1);
});

test("Returns a frozen event collection", () => {
  const store = new EventStore();
  const event = createEvent("event_1");

  store.append(event);
  const events = store.getAll();

  assert.strictEqual(Object.isFrozen(events), true);
  assert.throws(() => events.push(createEvent("event_2")), TypeError);
  assert.deepStrictEqual(store.getAll(), [event]);
});

test("Does not expose its internal event collection", () => {
  const store = new EventStore();

  store.append(createEvent("event_1"));

  const firstRead = store.getAll();
  const secondRead = store.getAll();

  assert.notStrictEqual(firstRead, secondRead);
  assert.deepStrictEqual(firstRead, secondRead);
});

test("Rejects an invalid lookup identifier", () => {
  const store = new EventStore();

  assert.throws(
    () => store.getById(""),
    /eventId must be a non-empty string/
  );
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
