"use strict";

const assert = require("assert");
const {
  formatWorldTime,
  recordTimePassedEvent
} = require("../../src/game/actions/waitAction");

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

function createWorld(overrides = {}) {
  return {
    currentTime: "03:35",
    calendar: {
      year: 2045,
      month: 1,
      dayOfMonth: 2
    },
    ...overrides
  };
}

console.log("================================");
console.log("WAIT ACTION TESTS");
console.log("================================");
console.log("");

test("Formats the authoritative world time", () => {
  const worldTime = formatWorldTime(createWorld());

  assert.strictEqual(worldTime, "2045-01-02T03:35:00");
});

test("Records a TimePassed event", () => {
  let recordedData = null;
  const recordedEvent = { eventId: "event_1" };
  const context = {
    player: {
      id: "player_1",
      location: "back_alley_1"
    },
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  };

  const result = recordTimePassedEvent(
    context,
    createWorld(),
    { elapsedMinutes: 30 }
  );

  assert.strictEqual(result, recordedEvent);
  assert.deepStrictEqual(recordedData, {
    type: "TimePassed",
    worldTime: "2045-01-02T03:35:00",
    actorId: "player_1",
    locationId: "back_alley_1",
    payload: {
      elapsedMinutes: 30
    },
    metadata: {
      source: "waitAction"
    }
  });
});

test("Does not record when no recorder is supplied", () => {
  const result = recordTimePassedEvent(
    {
      player: { id: "player_1" },
      services: {}
    },
    createWorld(),
    { elapsedMinutes: 30 }
  );

  assert.strictEqual(result, null);
});

test("Supports players without a location identifier", () => {
  let recordedData = null;
  const context = {
    player: { id: "player_1" },
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  };

  recordTimePassedEvent(
    context,
    createWorld(),
    { elapsedMinutes: 5 }
  );

  assert.strictEqual(recordedData.locationId, null);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
