"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");
const {
  PresentationPipeline
} = require(
  "../../src/game/presentation/presentationPipeline"
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

function createPipeline(tracker = {}) {
  return new PresentationPipeline({
    aiContextBuilder: {
      build(options) {
        tracker.aiOptions = options;

        return Object.freeze({
          player: options.player,
          world: options.world,
          location: {
            id: "back_alley_1",
            name: "Back Alley"
          }
        });
      }
    },

    narrativeContextBuilder: {
      build(aiContext) {
        tracker.aiContext = aiContext;

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
    },

    narrator: {
      async narrate(request) {
        tracker.request = request;

        return Object.freeze({
          narration: "The alley glistens in the rain.",
          mode: request.mode,
          source: "test",
          proposedAction: null
        });
      }
    }
  });
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
  console.log("PRESENTATION PIPELINE TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Builds and narrates a presentation request",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);

      const result = await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around."
      });

      assert.strictEqual(
        result.narration,
        "The alley glistens in the rain."
      );
      assert.strictEqual(
        tracker.request instanceof NarrationRequest,
        true
      );
    }
  );

  await test(
    "Passes engine state to the AI context builder",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);
      const player = createPlayer();
      const world = createWorld();
      const eventHistory = {
        getRecent() {
          return [];
        }
      };

      await pipeline.present({
        player,
        world,
        playerInput: "I look around.",
        eventHistory,
        recentEventLimit: 5
      });

      assert.strictEqual(
        tracker.aiOptions.player,
        player
      );
      assert.strictEqual(
        tracker.aiOptions.world,
        world
      );
      assert.strictEqual(
        tracker.aiOptions.eventHistory,
        eventHistory
      );
      assert.strictEqual(
        tracker.aiOptions.recentEventLimit,
        5
      );
    }
  );

  await test(
    "Passes AI context to the narrative builder",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);

      await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around."
      });

      assert.strictEqual(
        tracker.aiContext.location.name,
        "Back Alley"
      );
    }
  );

  await test(
    "Creates the requested narration mode",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);

      const result = await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "Describe the alley.",
        mode: "describe_location"
      });

      assert.strictEqual(
        tracker.request.mode,
        "describe_location"
      );
      assert.strictEqual(
        result.mode,
        "describe_location"
      );
    }
  );

  await test(
    "Passes narration instructions",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);

      await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around.",
        instructions: {
          preservePlayerAgency: true
        }
      });

      assert.strictEqual(
        tracker.request.instructions
          .preservePlayerAgency,
        true
      );
    }
  );

  await test(
    "Returns the narrator result unchanged",
    async () => {
      const tracker = {};
      const pipeline = createPipeline(tracker);

      const result = await pipeline.present({
        player: createPlayer(),
        world: createWorld(),
        playerInput: "I look around."
      });

      assert.deepStrictEqual(result, {
        narration:
          "The alley glistens in the rain.",
        mode: "narrate_action",
        source: "test",
        proposedAction: null
      });
    }
  );

  await test(
    "Rejects an invalid AI context builder",
    () => {
      assert.throws(
        () => new PresentationPipeline({
          aiContextBuilder: {},
          narrativeContextBuilder: {
            build() {}
          },
          narrator: {
            narrate() {}
          }
        }),
        /aiContextBuilder must provide a build function/
      );
    }
  );

  await test(
    "Rejects an invalid narrative context builder",
    () => {
      assert.throws(
        () => new PresentationPipeline({
          aiContextBuilder: {
            build() {}
          },
          narrativeContextBuilder: {},
          narrator: {
            narrate() {}
          }
        }),
        /narrativeContextBuilder must provide a build function/
      );
    }
  );

  await test(
    "Rejects an invalid narrator",
    () => {
      assert.throws(
        () => new PresentationPipeline({
          aiContextBuilder: {
            build() {}
          },
          narrativeContextBuilder: {
            build() {}
          },
          narrator: {}
        }),
        /narrator must provide a narrate function/
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
