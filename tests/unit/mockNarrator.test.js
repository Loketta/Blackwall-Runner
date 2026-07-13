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

async function test(name, testFunction) {
  try {
    await testFunction();
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

async function runTests() {
  console.log("================================");
  console.log("MOCK NARRATOR TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Returns deterministic narration",
    async () => {
      const narrator = new MockNarrator();

      const result = await narrator.narrate(
        createRequest()
      );

      assert.strictEqual(
        result.narration,
        "Runner acts in Back Alley. " +
          "The weather is light rain."
      );
    }
  );

  await test(
    "Returns narration metadata",
    async () => {
      const narrator = new MockNarrator();

      const result = await narrator.narrate(
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
    }
  );

  await test(
    "Returns an immutable result",
    async () => {
      const result =
        await new MockNarrator().narrate(
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
    }
  );

  await test(
    "Uses safe fallbacks for missing context fields",
    async () => {
      const request = new NarrationRequest({
        playerInput: "I wait.",
        narrativeContext: {
          world: {},
          player: {},
          location: {}
        }
      });

      const result =
        await new MockNarrator().narrate(
          request
        );

      assert.strictEqual(
        result.narration,
        "The player acts in the current location. " +
          "The weather is unknown weather."
      );
    }
  );

  await test(
    "Rejects values that are not narration requests",
    async () => {
      const narrator = new MockNarrator();

      await assert.rejects(
        narrator.narrate({}),
        /requires a NarrationRequest/
      );
    }
  );

  console.log("");
  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log("================================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
