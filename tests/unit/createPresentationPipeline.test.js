"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");
const {
  MockNarrator
} = require("../../src/game/ai/mockNarrator");
const {
  OpenAINarrator
} = require("../../src/game/ai/openAINarrator");
const {
  createNarrator,
  createPresentationPipeline
} = require(
  "../../src/game/presentation/createPresentationPipeline"
);

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

function createAIContextBuilder() {
  return {
    build({ player, world }) {
      return Object.freeze({
        player,
        world,
        location: {
          id: "back_alley_1",
          name: "Back Alley"
        }
      });
    }
  };
}

function createNarrativeContextBuilder() {
  return {
    build(aiContext) {
      return Object.freeze({
        player: {
          id: aiContext.player.id,
          name: aiContext.player.name
        },
        world: {
          weather: aiContext.world.weather
        },
        location: aiContext.location
      });
    }
  };
}

function createPlayer() {
  return {
    id: "player_1",
    name: "Runner",
    location: "back_alley_1"
  };
}

function createWorld() {
  return {
    id: "world_1",
    weather: "light rain"
  };
}

async function runTests() {
  console.log("================================");
  console.log("PRESENTATION COMPOSITION TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Creates a mock narrator by default",
    () => {
      const narrator = createNarrator();

      assert.strictEqual(
        narrator instanceof MockNarrator,
        true
      );
    }
  );

  await test(
    "Normalises the narrator provider name",
    () => {
      const narrator = createNarrator({
        provider: "  MOCK  "
      });

      assert.strictEqual(
        narrator instanceof MockNarrator,
        true
      );
    }
  );

  await test(
    "Creates an OpenAI narrator",
    () => {
      const narrator = createNarrator({
        provider: "openai",
        client: {
          responses: {
            async create() {
              return {
                output_text: "Narration."
              };
            }
          }
        },
        model: "test-model"
      });

      assert.strictEqual(
        narrator instanceof OpenAINarrator,
        true
      );
    }
  );

  await test(
    "Rejects an unsupported narrator provider",
    () => {
      assert.throws(
        () => createNarrator({
          provider: "unknown"
        }),
        /Unsupported narrator provider/
      );
    }
  );

  await test(
    "Rejects an invalid provider value",
    () => {
      assert.throws(
        () => createNarrator({
          provider: ""
        }),
        /provider must be a non-empty string/
      );
    }
  );

  await test(
    "Creates a working mock presentation pipeline",
    async () => {
      const pipeline =
        createPresentationPipeline({
          aiContextBuilder:
            createAIContextBuilder(),
          narrativeContextBuilder:
            createNarrativeContextBuilder()
        });

      const result = await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around."
      });

      assert.deepStrictEqual(result, {
        narration:
          "Runner acts in Back Alley. " +
          "The weather is light rain.",
        mode: "narrate_action",
        source: "mock",
        proposedAction: null
      });
    }
  );

  await test(
    "Supports an explicitly injected narrator",
    async () => {
      let receivedRequest = null;

      const narrator = {
        async narrate(request) {
          receivedRequest = request;

          return Object.freeze({
            narration: "Injected narration.",
            mode: request.mode,
            source: "injected",
            proposedAction: null
          });
        }
      };

      const pipeline =
        createPresentationPipeline({
          provider: "unsupported-but-unused",
          aiContextBuilder:
            createAIContextBuilder(),
          narrativeContextBuilder:
            createNarrativeContextBuilder(),
          narrator
        });

      const result = await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around."
      });

      assert.strictEqual(
        receivedRequest instanceof NarrationRequest,
        true
      );

      assert.strictEqual(
        result.narration,
        "Injected narration."
      );

      assert.strictEqual(
        result.source,
        "injected"
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
