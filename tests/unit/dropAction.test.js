"use strict";

const assert = require("assert");
const {
  performDropAction
} = require("../../src/game/actions/dropAction");

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
    items: []
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
    removeItem(player, itemId) {
      const index = player.inventory.indexOf(itemId);

      if (index === -1) {
        return null;
      }

      return player.inventory.splice(index, 1)[0];
    },
    addItemToLocation(targetLocation, itemId) {
      targetLocation.items.push(itemId);
    },
    saveLocation() {},
    savePlayer() {},
    loadWorld: createWorld
  };

  return {
    player: {
      id: "player_runner_1",
      location: "back_alley_1",
      inventory: ["protein_bar"]
    },
    action: {
      type: "drop",
      itemInput: "protein bar"
    },
    ...overrides,
    services: {
      ...services,
      ...(overrides.services || {})
    }
  };
}

console.log("================================");
console.log("DROP ACTION TESTS");
console.log("================================");
console.log("");

test("Records a player-to-ground item transfer", () => {
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

  const result = performDropAction(context);

  assert.strictEqual(result.success, true);
  assert.strictEqual(
    result.message,
    "You drop Protein Bar."
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
    "player_runner_1"
  );
  assert.strictEqual(
    recordedData.payload.toEntityId,
    "back_alley_1"
  );
});

test("Preserves the successful inventory transfer", () => {
  const context = createSuccessfulContext();

  const result = performDropAction(context);

  assert.strictEqual(result.success, true);
  assert.deepStrictEqual(
    context.player.inventory,
    []
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

  const result = performDropAction(context);

  assert.strictEqual(result.success, false);
  assert.strictEqual(
    result.message,
    "I do not recognise that item."
  );
  assert.strictEqual(recordCalls, 0);
  assert.strictEqual(worldLoadCalls, 0);
});

test("Does not record when the player lacks the item", () => {
  let recordCalls = 0;
  let worldLoadCalls = 0;

  const context = createSuccessfulContext({
    services: {
      removeItem() {
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

  const result = performDropAction(context);

  assert.strictEqual(result.success, false);
  assert.strictEqual(
    result.message,
    "You do not have that item."
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

  performDropAction(context);

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
