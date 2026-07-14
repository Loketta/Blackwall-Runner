"use strict";

const assert = require("assert");
const {
  CommandNarrationService
} = require(
  "../../src/game/presentation/commandNarrationService"
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

function createService(tracker = {}) {
  const world = {
    id: "world_1",
    weather: "light rain"
  };

  const eventHistory = {
    getRecent() {
      return [];
    }
  };

  const narrationResult = {
    narration:
      "Rain runs down the alley walls."
  };

  const service =
    new CommandNarrationService({
      loadWorld() {
        tracker.worldWasLoaded = true;
        return world;
      },

      getEventServices() {
        tracker.eventServicesWereLoaded =
          true;

        return {
          eventHistory
        };
      },

      presentationPipeline: {
        async present(options) {
          tracker.presentationWasCalled =
            true;
          tracker.presentationOptions =
            options;

          return narrationResult;
        }
      }
    });

  return {
    service,
    expected: {
      world,
      eventHistory,
      narrationResult
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log(
    "COMMAND NARRATION SERVICE TESTS"
  );
  console.log("================================");
  console.log("");

  await test(
    "Builds a command narration request",
    async () => {
      const tracker = {};
      const player = {
        id: "player_runner_1",
        name: "Runner"
      };

      const {
        service,
        expected
      } = createService(tracker);

      const instructions = {
        preservePlayerAgency: true,
        useOnlyProvidedFacts: true
      };

      const result =
        await service.createNarration({
          player,
          playerInput: "I look around.",
          mode: "describe_location",
          instructions,
          recentEventLimit: 5
        });

      assert.strictEqual(
        tracker.worldWasLoaded,
        true
      );

      assert.strictEqual(
        tracker.eventServicesWereLoaded,
        true
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        true
      );

      assert.deepStrictEqual(
        tracker.presentationOptions,
        {
          player,
          world: expected.world,
          playerInput: "I look around.",
          eventHistory:
            expected.eventHistory,
          recentEventLimit: 5,
          mode: "describe_location",
          instructions
        }
      );

      assert.strictEqual(
        result,
        expected.narrationResult
      );
    }
  );

  await test(
    "Uses narration defaults",
    async () => {
      const tracker = {};
      const {
        service
      } = createService(tracker);

      await service.createNarration({
        player: {
          id: "player_runner_1"
        },
        playerInput: "I talk to Finch."
      });

      assert.strictEqual(
        tracker.presentationOptions.mode,
        "narrate_action"
      );

      assert.strictEqual(
        tracker.presentationOptions
          .recentEventLimit,
        10
      );

      assert.deepStrictEqual(
        tracker.presentationOptions
          .instructions,
        {}
      );
    }
  );

  await test(
    "Uses null when event history is unavailable",
    async () => {
      const tracker = {};

      const service =
        new CommandNarrationService({
          loadWorld() {
            return {
              id: "world_1"
            };
          },

          getEventServices() {
            return null;
          },

          presentationPipeline: {
            async present(options) {
              tracker.presentationOptions =
                options;

              return {
                narration: "Narration."
              };
            }
          }
        });

      await service.createNarration({
        player: {
          id: "player_runner_1"
        },
        playerInput: "I open the crate."
      });

      assert.strictEqual(
        tracker.presentationOptions
          .eventHistory,
        null
      );
    }
  );

  await test(
    "Awaits asynchronous narration",
    async () => {
      const service =
        new CommandNarrationService({
          loadWorld() {
            return {
              id: "world_1"
            };
          },

          getEventServices() {
            return {
              eventHistory: null
            };
          },

          presentationPipeline: {
            async present() {
              await Promise.resolve();

              return {
                narration:
                  "Asynchronous narration."
              };
            }
          }
        });

      const result =
        await service.createNarration({
          player: {
            id: "player_runner_1"
          },
          playerInput: "I move north."
        });

      assert.strictEqual(
        result.narration,
        "Asynchronous narration."
      );
    }
  );

  await test(
    "Propagates pipeline failures",
    async () => {
      const service =
        new CommandNarrationService({
          loadWorld() {
            return {
              id: "world_1"
            };
          },

          getEventServices() {
            return {
              eventHistory: null
            };
          },

          presentationPipeline: {
            async present() {
              throw new Error(
                "Narration unavailable."
              );
            }
          }
        });

      await assert.rejects(
        () => service.createNarration({
          player: {
            id: "player_runner_1"
          },
          playerInput: "I look around."
        }),
        /Narration unavailable/
      );
    }
  );

  await test(
    "Rejects invalid dependencies",
    async () => {
      assert.throws(
        () => new CommandNarrationService({
          loadWorld: null,
          getEventServices() {},
          presentationPipeline: {
            async present() {}
          }
        }),
        /loadWorld must be a function/
      );

      assert.throws(
        () => new CommandNarrationService({
          loadWorld() {},
          getEventServices: null,
          presentationPipeline: {
            async present() {}
          }
        }),
        /getEventServices must be a function/
      );

      assert.throws(
        () => new CommandNarrationService({
          loadWorld() {},
          getEventServices() {},
          presentationPipeline: {}
        }),
        /presentationPipeline must provide a present function/
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
