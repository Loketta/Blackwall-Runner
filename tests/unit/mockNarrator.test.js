"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");
const {
  MockNarrator
} = require("../../src/game/ai/mockNarrator");

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

function createRequest(overrides = {}) {
  return new NarrationRequest({
    playerInput: "I check the alley.",
    narrativeContext: {
      world: {
        weather: "light rain"
      },
      player: {
        name: "Runner"
      },
      location: {
        name: "Back Alley"
      }
    },
    ...overrides
  });
}

console.log("================================");
console.log("MOCK NARRATOR TESTS");
console.log("================================");
console.log("");

test("Returns deterministic narration", () => {
  const narrator = new MockNarrator();

  const result = narrator.narrate(
    createRequest()
  );

  assert.strictEqual(
    result.narration,
    "Runner acts in Back Alley. " +
      "The weather is light rain."
  );
});

test("Returns narration metadata", () => {
  const narrator = new MockNarrator();

  const result = narrator.narrate(
    createRequest({
      mode: "describe_action"
    })
  );

  assert.deepStrictEqual(result, {
    narration:
      "Runner acts in Back Alley. " +
      "The weather is light rain.",
    mode: "describe_action",
    source: "mock",
    proposedAction: null
  });
});

test("Returns an immutable result", () => {
  const result = new MockNarrator().narrate(
    createRequest()
  );

  assert.strictEqual(
    Object.isFrozen(result),
    true
  );

  assert.throws(
    () => {
      result.source = "changed";
    },
    TypeError
  );
});

test("Uses safe fallbacks for missing context fields", () => {
  const request = new NarrationRequest({
    playerInput: "I wait.",
    narrativeContext: {
      world: {},
      player: {},
      location: {}
    }
  });

  const result = new MockNarrator().narrate(
    request
  );

  assert.strictEqual(
    result.narration,
    "The player acts in the current location. " +
      "The weather is unknown weather."
  );
});

test("Rejects values that are not narration requests", () => {
  const narrator = new MockNarrator();

  assert.throws(
    () => narrator.narrate({}),
    /requires a NarrationRequest/
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
