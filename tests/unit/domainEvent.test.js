"use strict";

const assert = require("assert");
const { DomainEvent } = require("../../src/game/events/domainEvent");

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

function createEvent(overrides = {}) {
  return new DomainEvent({
    eventId: "event_1",
    type: "DoorStateChanged",
    worldTime: "2045-07-12T14:30:00",
    actorId: "player_1",
    targetIds: ["door_1"],
    locationId: "back_alley_1",
    payload: {
      previousState: "closed",
      newState: "open"
    },
    ...overrides
  });
}

console.log("================================");
console.log("DOMAIN EVENT TESTS");
console.log("================================");
console.log("");

test("Stores the event contract fields", () => {
  const event = createEvent({
    visibility: "hidden",
    parentEventId: "event_parent",
    causationId: "action_1",
    metadata: { source: "openContainerAction" }
  });

  assert.strictEqual(event.eventId, "event_1");
  assert.strictEqual(event.type, "DoorStateChanged");
  assert.strictEqual(event.worldTime, "2045-07-12T14:30:00");
  assert.strictEqual(event.actorId, "player_1");
  assert.deepStrictEqual(event.targetIds, ["door_1"]);
  assert.strictEqual(event.locationId, "back_alley_1");
  assert.strictEqual(event.visibility, "hidden");
  assert.strictEqual(event.parentEventId, "event_parent");
  assert.strictEqual(event.causationId, "action_1");
  assert.deepStrictEqual(event.metadata, { source: "openContainerAction" });
});

test("Provides safe defaults for optional fields", () => {
  const event = new DomainEvent({
    eventId: "event_2",
    type: "TimePassed",
    worldTime: "2045-07-12T15:00:00"
  });

  assert.strictEqual(event.actorId, null);
  assert.deepStrictEqual(event.targetIds, []);
  assert.strictEqual(event.locationId, null);
  assert.strictEqual(event.visibility, "public");
  assert.deepStrictEqual(event.payload, {});
  assert.strictEqual(event.parentEventId, null);
  assert.strictEqual(event.causationId, null);
  assert.deepStrictEqual(event.metadata, {});
});

test("Freezes the event and nested event data", () => {
  const event = createEvent({
    payload: {
      state: { open: true },
      witnesses: ["npc_1"]
    }
  });

  assert.strictEqual(Object.isFrozen(event), true);
  assert.strictEqual(Object.isFrozen(event.targetIds), true);
  assert.strictEqual(Object.isFrozen(event.payload), true);
  assert.strictEqual(Object.isFrozen(event.payload.state), true);
  assert.strictEqual(Object.isFrozen(event.payload.witnesses), true);
});

test("Does not retain mutable references supplied by the caller", () => {
  const payload = { state: { open: true } };
  const targetIds = ["door_1"];
  const event = createEvent({ payload, targetIds });

  payload.state.open = false;
  targetIds.push("door_2");

  assert.strictEqual(event.payload.state.open, true);
  assert.deepStrictEqual(event.targetIds, ["door_1"]);
});

test("Rejects a missing event identifier", () => {
  assert.throws(
    () => createEvent({ eventId: "" }),
    /eventId must be a non-empty string/
  );
});

test("Rejects a missing event type", () => {
  assert.throws(
    () => createEvent({ type: "" }),
    /type must be a non-empty string/
  );
});

test("Rejects a missing world time", () => {
  assert.throws(
    () => createEvent({ worldTime: "" }),
    /worldTime must be a non-empty string/
  );
});

test("Rejects invalid target identifiers", () => {
  assert.throws(
    () => createEvent({ targetIds: [""] }),
    /targetIds entry must be a non-empty string/
  );
});

test("Rejects non-object payload data", () => {
  assert.throws(
    () => createEvent({ payload: [] }),
    /payload must be an object/
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
