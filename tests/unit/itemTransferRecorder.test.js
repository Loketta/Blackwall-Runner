"use strict";

const assert = require("assert");
const {
  recordItemTransferredEvent
} = require("../../src/game/events/itemTransferRecorder");

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

function createWorld() {
  return {
    currentTime: "03:35",
    calendar: {
      year: 2045,
      month: 1,
      dayOfMonth: 2
    }
  };
}

function createContext(overrides = {}) {
  return {
    player: {
      id: "player_runner_1",
      location: "back_alley_1"
    },
    services: {},
    ...overrides
  };
}

console.log("================================");
console.log("ITEM TRANSFER RECORDER TESTS");
console.log("================================");
console.log("");

test("Records an ItemTransferred event", () => {
  let recordedData = null;
  const recordedEvent = {
    eventId: "event_1"
  };

  const context = createContext({
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  });

  const result = recordItemTransferredEvent({
    context,
    world: createWorld(),
    itemId: "protein_bar",
    fromEntityId: "back_alley_1",
    toEntityId: "player_runner_1",
    source: "takeAction"
  });

  assert.strictEqual(result, recordedEvent);

  assert.deepStrictEqual(recordedData, {
    type: "ItemTransferred",
    worldTime: "2045-01-02T03:35:00",
    actorId: "player_runner_1",
    targetIds: [
      "protein_bar",
      "back_alley_1",
      "player_runner_1"
    ],
    locationId: "back_alley_1",
    payload: {
      itemId: "protein_bar",
      fromEntityId: "back_alley_1",
      toEntityId: "player_runner_1",
      quantity: 1
    },
    metadata: {
      source: "takeAction"
    }
  });
});

test("Records an explicit quantity", () => {
  let recordedData = null;

  const context = createContext({
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  });

  recordItemTransferredEvent({
    context,
    world: createWorld(),
    itemId: "protein_bar",
    fromEntityId: "alley_crate",
    toEntityId: "player_runner_1",
    quantity: 3,
    source: "takeFromContainerAction"
  });

  assert.strictEqual(
    recordedData.payload.quantity,
    3
  );
});

test("Uses locationId when supplied by the player", () => {
  let recordedData = null;

  const context = createContext({
    player: {
      id: "player_runner_1",
      locationId: "safehouse_1",
      location: "back_alley_1"
    },
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  });

  recordItemTransferredEvent({
    context,
    world: createWorld(),
    itemId: "unity_pistol",
    fromEntityId: "player_runner_1",
    toEntityId: "safehouse_1",
    source: "dropAction"
  });

  assert.strictEqual(
    recordedData.locationId,
    "safehouse_1"
  );
});

test("Supports players without a location identifier", () => {
  let recordedData = null;

  const context = createContext({
    player: {
      id: "player_runner_1"
    },
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  });

  recordItemTransferredEvent({
    context,
    world: createWorld(),
    itemId: "unity_pistol",
    fromEntityId: "player_runner_1",
    toEntityId: "alley_crate",
    source: "dropIntoContainerAction"
  });

  assert.strictEqual(recordedData.locationId, null);
});

test("Does not record when no recorder is supplied", () => {
  const result = recordItemTransferredEvent({
    context: createContext(),
    world: createWorld(),
    itemId: "protein_bar",
    fromEntityId: "back_alley_1",
    toEntityId: "player_runner_1",
    source: "takeAction"
  });

  assert.strictEqual(result, null);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
