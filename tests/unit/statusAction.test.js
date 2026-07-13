"use strict";

const assert = require("assert");
const {
  performStatusAction
} = require("../../src/game/actions/statusAction");

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

function createContext(tracker = {}) {
  const world = {
    day: 4,
    currentTime: "21:30",
    weather: "light rain"
  };

  return {
    player: {
      name: "Runner",
      role: "Solo",
      health: 35,
      credits: 1200,
      location: "back_alley_1"
    },
    action: {
      type: "status"
    },
    services: {
      loadWorld() {
        tracker.worldWasLoaded = true;
        return world;
      }
    },
    expectedWorld: world
  };
}

console.log("================================");
console.log("STATUS ACTION TESTS");
console.log("================================");
console.log("");

test("Returns current player status", () => {
  const result = performStatusAction(
    createContext()
  );

  assert.deepStrictEqual(
    result.data.status,
    {
      name: "Runner",
      role: "Solo",
      health: 35,
      credits: 1200,
      location: "back_alley_1"
    }
  );
});

test("Loads authoritative world state", () => {
  const tracker = {};
  const context = createContext(tracker);
  const result = performStatusAction(context);

  assert.strictEqual(
    tracker.worldWasLoaded,
    true
  );
  assert.strictEqual(
    result.data.world,
    context.expectedWorld
  );
});

test("Returns successful action result", () => {
  const result = performStatusAction(
    createContext()
  );

  assert.strictEqual(result.success, true);
  assert.strictEqual(
    result.message,
    "You check your status."
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
