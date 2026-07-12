"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");

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

function createContext() {
  return {
    world: {
      time: "2045-01-02T03:05:00",
      weather: "light rain"
    },
    player: {
      id: "player_1",
      name: "Runner"
    },
    location: {
      id: "back_alley_1",
      name: "Back Alley"
    }
  };
}

console.log("================================");
console.log("NARRATION REQUEST TESTS");
console.log("================================");
console.log("");

test("Stores the narration request contract", () => {
  const context = createContext();

  const request = new NarrationRequest({
    playerInput: "I check the alley.",
    narrativeContext: context,
    mode: "describe_action",
    instructions: {
      preservePlayerAgency: true
    }
  });

  assert.strictEqual(
    request.playerInput,
    "I check the alley."
  );
  assert.strictEqual(
    request.mode,
    "describe_action"
  );
  assert.strictEqual(
    request.narrativeContext.player.name,
    "Runner"
  );
  assert.strictEqual(
    request.instructions.preservePlayerAgency,
    true
  );
});

test("Uses the default narration mode", () => {
  const request = new NarrationRequest({
    playerInput: "I wait.",
    narrativeContext: createContext()
  });

  assert.strictEqual(
    request.mode,
    "narrate_action"
  );
});

test("Defaults instructions to an empty object", () => {
  const request = new NarrationRequest({
    playerInput: "I look around.",
    narrativeContext: createContext()
  });

  assert.deepStrictEqual(
    request.instructions,
    {}
  );
});

test("Returns an immutable request", () => {
  const request = new NarrationRequest({
    playerInput: "I move closer.",
    narrativeContext: createContext()
  });

  assert.strictEqual(
    Object.isFrozen(request),
    true
  );
  assert.strictEqual(
    Object.isFrozen(request.narrativeContext),
    true
  );
  assert.strictEqual(
    Object.isFrozen(request.narrativeContext.player),
    true
  );

  assert.throws(
    () => {
      request.mode = "changed";
    },
    TypeError
  );
});

test("Does not retain mutable source references", () => {
  const context = createContext();

  const request = new NarrationRequest({
    playerInput: "I listen.",
    narrativeContext: context
  });

  context.player.name = "Changed";
  context.world.weather = "storm";

  assert.strictEqual(
    request.narrativeContext.player.name,
    "Runner"
  );
  assert.strictEqual(
    request.narrativeContext.world.weather,
    "light rain"
  );
});

test("Rejects an invalid player input", () => {
  assert.throws(
    () => new NarrationRequest({
      playerInput: "",
      narrativeContext: createContext()
    }),
    /playerInput must be a non-empty string/
  );
});

test("Rejects an invalid mode", () => {
  assert.throws(
    () => new NarrationRequest({
      playerInput: "I wait.",
      narrativeContext: createContext(),
      mode: ""
    }),
    /mode must be a non-empty string/
  );
});

test("Rejects an invalid narrative context", () => {
  assert.throws(
    () => new NarrationRequest({
      playerInput: "I wait.",
      narrativeContext: null
    }),
    /narrativeContext must be an object/
  );
});

test("Rejects invalid instructions", () => {
  assert.throws(
    () => new NarrationRequest({
      playerInput: "I wait.",
      narrativeContext: createContext(),
      instructions: []
    }),
    /instructions must be an object/
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
