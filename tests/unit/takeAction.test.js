"use strict";

const assert = require("assert");
const {
  performTakeAction
} = require("../../src/game/actions/takeAction");

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

function createSuccessfulContext(overrides = {}) {
  const location = {
    id: "back_alley_1",
    items: ["protein_bar"]
  };

  const services = {
    resolveItem() {
      return {
        id: "protein_bar",
        name: "Protein Bar"
      };
    },
    loadLocation() {
      return location;
    },
    removeItemFromLocation(targetLocation, itemId) {
      const index = targetLocation.items.indexOf(itemId);

      if (index === -1) {
        return null;
      }

      return targetLocation.items.splice(index, 1)[0];
    },
    addItem(player, itemId) {
      player.inventory.push(itemId);
    },
    saveLocation() {},
    savePlayer() {},
    loadWorld: createWorld
  };

  return {
    player: {
      id: "player_runner_1",
      location: "back_alley_1",
      inventory: []
    },
    action: {
      type: "take",
      itemInput: "protein bar"
    },
    services: {
      ...services,
      ...(overrides.services || {})
    },
    ...overrides,
    services: {
      ...services,
      ...(overrides.services || {})
    }
  };
}

console.log("================================");
console.log("TAKE ACTION TESTS");
console.log("================================");
console.log("");

test("Records a ground-to-player item transfer", () => {
  let recordedData = null;
  const recordedEvent = {
    eventId: "event_1"
  };

  const context = createSuccessfulContext({
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  });

  const result = performTakeAction(context);

  assert.strictEqual(result.success, true);
  assert.strictEqual(
    result.message,
    "You take Protein Bar."
  );
  assert.strictEqual(
    result.data.recordedEvent,
    recordedEvent
  );
  assert.strictEqual(
    recordedData.type,
    "ItemTransferred"
  );
  assert.strictEqual(
    recordedData.payload.itemId,
    "protein_bar"
  );
  assert.strictEqual(
    recordedData.payload.fromEntityId,
    "back_alley_1"
  );
  assert.strictEqual(
    recordedData.payload.toEntityId,
    "player_runner_1"
  );
});

test("Preserves the successful inventory transfer", () => {
  const context = createSuccessfulContext();

  const result = performTakeAction(context);

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(
    context.player.inventory,
    ["protein_bar"]
  );
  assert.strictEqual(
    result.data.itemId,
    "protein_bar"
  );
  assert.strictEqual(
    result.data.recordedEvent,
    null
  );
});

test("Does not record when the item is unrecognised", () => {
  let recordCalls = 0;
  let worldLoadCalls = 0;

  const context = createSuccessfulContext({
    services: {
      resolveItem() {
        return undefined;
      },
      loadWorld() {
        worldLoadCalls += 1;
        return createWorld();
      },
      eventRecorder: {
        record() {
          recordCalls += 1;
        }
      }
    }
  });

  const result = performTakeAction(context);

  assert.strictEqual(result.success, false);
  assert.strictEqual(
    result.message,
    "I do not recognise that item."
  );
  assert.strictEqual(recordCalls, 0);
  assert.strictEqual(worldLoadCalls, 0);
});

test("Does not record when the item is absent", () => {
  let recordCalls = 0;
  let worldLoadCalls = 0;

  const context = createSuccessfulContext({
    services: {
      removeItemFromLocation() {
        return null;
      },
      loadWorld() {
        worldLoadCalls += 1;
        return createWorld();
      },
      eventRecorder: {
        record() {
          recordCalls += 1;
        }
      }
    }
  });

  const result = performTakeAction(context);

  assert.strictEqual(result.success, false);
  assert.strictEqual(
    result.message,
    "That item is not here."
  );
  assert.strictEqual(recordCalls, 0);
  assert.strictEqual(worldLoadCalls, 0);
});

test("Uses the authoritative world time", () => {
  let recordedData = null;

  const context = createSuccessfulContext({
    services: {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  });

  performTakeAction(context);

  assert.strictEqual(
    recordedData.worldTime,
    "2045-01-02T03:35:00"
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
