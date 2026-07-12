"use strict";

const assert = require("assert");
const {
  performMoveAction,
  recordCharacterTravelledEvent
} = require("../../src/game/actions/moveAction");

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
    action: {
      type: "move",
      exit: "safehouse"
    },
    services: {},
    ...overrides
  };
}

console.log("================================");
console.log("MOVE ACTION TESTS");
console.log("================================");
console.log("");

test("Records a CharacterTravelled event", () => {
  let recordedData = null;
  const recordedEvent = { eventId: "event_1" };

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

  const result = recordCharacterTravelledEvent(
    context,
    createWorld(),
    "back_alley_1",
    "safehouse_1"
  );

  assert.strictEqual(result, recordedEvent);
  assert.deepStrictEqual(recordedData, {
    type: "CharacterTravelled",
    worldTime: "2045-01-02T03:35:00",
    actorId: "player_runner_1",
    locationId: "safehouse_1",
    payload: {
      originLocationId: "back_alley_1",
      destinationLocationId: "safehouse_1"
    },
    metadata: {
      source: "moveAction"
    }
  });
});

test("Does not record when no recorder is supplied", () => {
  const result = recordCharacterTravelledEvent(
    createContext(),
    createWorld(),
    "back_alley_1",
    "safehouse_1"
  );

  assert.strictEqual(result, null);
});

test("Returns the recorded event after successful movement", () => {
  const recordedEvent = { eventId: "event_1" };

  const context = createContext({
    services: {
      movePlayer(player) {
        player.location = "safehouse_1";

        return {
          id: "safehouse_1",
          name: "Safehouse 1"
        };
      },
      loadWorld: createWorld,
      eventRecorder: {
        record() {
          return recordedEvent;
        }
      }
    }
  });

  const result = performMoveAction(context);

  assert.strictEqual(result.success, true);
  assert.strictEqual(
    result.message,
    "You move to Safehouse 1."
  );
  assert.strictEqual(
    result.data.location.id,
    "safehouse_1"
  );
  assert.strictEqual(
    result.data.recordedEvent,
    recordedEvent
  );
});

test("Records the location before movement as the origin", () => {
  let recordedData = null;

  const context = createContext({
    services: {
      movePlayer(player) {
        player.location = "safehouse_1";

        return {
          id: "safehouse_1",
          name: "Safehouse 1"
        };
      },
      loadWorld: createWorld,
      eventRecorder: {
        record(data) {
          recordedData = data;
          return data;
        }
      }
    }
  });

  performMoveAction(context);

  assert.strictEqual(
    recordedData.payload.originLocationId,
    "back_alley_1"
  );
  assert.strictEqual(
    recordedData.payload.destinationLocationId,
    "safehouse_1"
  );
});

test("Does not record an event when movement fails", () => {
  let recordCalls = 0;
  let worldLoadCalls = 0;

  const context = createContext({
    services: {
      movePlayer() {
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

  const result = performMoveAction(context);

  assert.strictEqual(result.success, false);
  assert.strictEqual(
    result.message,
    "You cannot go that way."
  );
  assert.strictEqual(recordCalls, 0);
  assert.strictEqual(worldLoadCalls, 0);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
