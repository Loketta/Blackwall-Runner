"use strict";

const assert = require("assert");
const {
  DomainEvent
} = require("../../src/game/events/domainEvent");
const {
  EventStore
} = require("../../src/game/events/eventStore");
const {
  EventHistory
} = require("../../src/game/events/eventHistory");

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
    payload: {},
    ...overrides
  });
}

function createHistory() {
  const eventStore = new EventStore();

  eventStore.append(
    createEvent("event_1", {
      worldTime: "2045-07-12T14:30:00"
    })
  );

  eventStore.append(
    createEvent("event_2", {
      type: "ItemTransferred",
      worldTime: "2045-07-12T14:35:00",
      actorId: "player_2",
      targetIds: ["item_1", "container_1"],
      locationId: "market_1"
    })
  );

  eventStore.append(
    createEvent("event_3", {
      type: "WeatherChanged",
      worldTime: "2045-07-12T14:40:00",
      actorId: null,
      targetIds: [],
      locationId: null
    })
  );

  eventStore.append(
    createEvent("event_4", {
      worldTime: "2045-07-12T14:45:00",
      actorId: "player_1",
      targetIds: ["market_1"],
      locationId: "market_1"
    })
  );

  return new EventHistory({ eventStore });
}

console.log("================================");
console.log("EVENT HISTORY TESTS");
console.log("================================");
console.log("");

test("Returns all events in stored order", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getAll().map((event) => event.eventId),
    ["event_1", "event_2", "event_3", "event_4"]
  );
});

test("Finds events by type", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getByType("CharacterTravelled")
      .map((event) => event.eventId),
    ["event_1", "event_4"]
  );
});

test("Finds events by actor", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getByActor("player_1")
      .map((event) => event.eventId),
    ["event_1", "event_4"]
  );
});

test("Finds events involving a target", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getByTarget("container_1")
      .map((event) => event.eventId),
    ["event_2"]
  );
});

test("Finds events by location", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getByLocation("market_1")
      .map((event) => event.eventId),
    ["event_2", "event_4"]
  );
});

test("Finds events inside an inclusive time range", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getBetween(
      "2045-07-12T14:35:00",
      "2045-07-12T14:40:00"
    ).map((event) => event.eventId),
    ["event_2", "event_3"]
  );
});

test("Returns the most recent events in order", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getRecent(2)
      .map((event) => event.eventId),
    ["event_3", "event_4"]
  );
});

test("Returns all events when recent limit exceeds count", () => {
  const history = createHistory();

  assert.strictEqual(
    history.getRecent(20).length,
    4
  );
});

test("Returns an empty collection for a zero limit", () => {
  const history = createHistory();

  assert.deepStrictEqual(
    history.getRecent(0),
    []
  );
});

test("Returns frozen query collections", () => {
  const history = createHistory();
  const events = history.getByType(
    "CharacterTravelled"
  );

  assert.strictEqual(
    Object.isFrozen(events),
    true
  );
  assert.throws(
    () => events.push(createEvent("event_5")),
    TypeError
  );
});

test("Rejects an invalid event store", () => {
  assert.throws(
    () => new EventHistory({
      eventStore: {}
    }),
    /requires an event store with a getAll function/
  );
});

test("Rejects invalid string query values", () => {
  const history = createHistory();

  assert.throws(
    () => history.getByType(""),
    /type must be a non-empty string/
  );

  assert.throws(
    () => history.getByActor(""),
    /actorId must be a non-empty string/
  );

  assert.throws(
    () => history.getByTarget(""),
    /targetId must be a non-empty string/
  );

  assert.throws(
    () => history.getByLocation(""),
    /locationId must be a non-empty string/
  );
});

test("Rejects an inverted time range", () => {
  const history = createHistory();

  assert.throws(
    () => history.getBetween(
      "2045-07-12T14:45:00",
      "2045-07-12T14:30:00"
    ),
    /startWorldTime must not be later/
  );
});

test("Rejects invalid recent limits", () => {
  const history = createHistory();

  assert.throws(
    () => history.getRecent(-1),
    /limit must be a non-negative integer/
  );

  assert.throws(
    () => history.getRecent(1.5),
    /limit must be a non-negative integer/
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
