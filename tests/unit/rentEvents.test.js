"use strict";

const assert = require("assert");
const {
  processRentEvents,
  recordRentDueEvent
} = require("../../src/game/events/rentEvents");

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
    currentTime: "09:00",
    calendar: {
      year: 2045,
      month: 3,
      dayOfMonth: 1
    },
    rent: {
      monthlyCost: 1000,
      dueDayOfMonth: 1,
      lastChargedYear: 2045,
      lastChargedMonth: 2
    },
    ...overrides
  };
}

console.log("================================");
console.log("RENT EVENT TESTS");
console.log("================================");
console.log("");

test("Records a RentDue event", () => {
  let recordedData = null;
  const recordedEvent = {
    eventId: "event_1"
  };

  const result = recordRentDueEvent(
    createWorld(),
    {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  );

  assert.strictEqual(result, recordedEvent);
  assert.deepStrictEqual(recordedData, {
    type: "RentDue",
    worldTime: "2045-03-01T09:00:00",
    payload: {
      monthlyCost: 1000,
      dueDayOfMonth: 1,
      year: 2045,
      month: 3,
      dayOfMonth: 1
    },
    metadata: {
      source: "rentEvents"
    }
  });
});

test("Marks rent as charged and returns the event", () => {
  const world = createWorld();
  const recordedEvent = {
    eventId: "event_1"
  };

  const events = processRentEvents(world, {
    eventRecorder: {
      record() {
        return recordedEvent;
      }
    }
  });

  assert.strictEqual(
    world.rent.lastChargedYear,
    2045
  );
  assert.strictEqual(
    world.rent.lastChargedMonth,
    3
  );
  assert.deepStrictEqual(events, [recordedEvent]);
});

test("Marks rent as charged without a recorder", () => {
  const world = createWorld();

  const events = processRentEvents(world);

  assert.strictEqual(
    world.rent.lastChargedYear,
    2045
  );
  assert.strictEqual(
    world.rent.lastChargedMonth,
    3
  );
  assert.deepStrictEqual(events, []);
});

test("Does not process rent before the due day", () => {
  const world = createWorld({
    calendar: {
      year: 2045,
      month: 3,
      dayOfMonth: 2
    }
  });

  let recordWasCalled = false;

  const events = processRentEvents(world, {
    eventRecorder: {
      record() {
        recordWasCalled = true;
      }
    }
  });

  assert.strictEqual(recordWasCalled, false);
  assert.strictEqual(
    world.rent.lastChargedMonth,
    2
  );
  assert.deepStrictEqual(events, []);
});

test("Does not charge rent twice in one month", () => {
  const world = createWorld({
    rent: {
      monthlyCost: 1000,
      dueDayOfMonth: 1,
      lastChargedYear: 2045,
      lastChargedMonth: 3
    }
  });

  let recordWasCalled = false;

  const events = processRentEvents(world, {
    eventRecorder: {
      record() {
        recordWasCalled = true;
      }
    }
  });

  assert.strictEqual(recordWasCalled, false);
  assert.deepStrictEqual(events, []);
});

test("Does not process a world without rent data", () => {
  const world = createWorld();
  delete world.rent;

  const events = processRentEvents(world);

  assert.deepStrictEqual(events, []);
});

test("Does not process a world without calendar data", () => {
  const world = createWorld();
  delete world.calendar;

  const events = processRentEvents(world);

  assert.deepStrictEqual(events, []);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
