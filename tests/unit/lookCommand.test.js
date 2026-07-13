"use strict";

const assert = require("assert");
const {
  runLookCommand
} = require(
  "../../src/commands/handlers/lookCommand"
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

function createPlayer() {
  return {
    id: "player_1",
    name: "Runner",
    location: "back_alley_1"
  };
}

function createServices(tracker = {}) {
  const location = {
    id: "back_alley_1",
    name: "Back Alley"
  };

  const world = {
    id: "world_1",
    weather: "light rain"
  };

  const eventHistory = {
    getRecent() {
      return [];
    }
  };

  return {
    performAction(player, action) {
      tracker.actionPlayer = player;
      tracker.action = action;

      return {
        success: true,
        message: "You look around.",
        data: {
          location
        }
      };
    },

    describeLocation(receivedLocation) {
      tracker.describedLocation =
        receivedLocation;
    },

    loadWorld() {
      tracker.worldWasLoaded = true;
      return world;
    },

    getEventServices() {
      tracker.eventServicesWereLoaded = true;

      return {
        eventHistory
      };
    },

    presentationMode: "player",

    presentationPipeline: {
      async present(options) {
        tracker.presentationWasCalled = true;
        tracker.presentationOptions =
          options;

        return {
          narration:
            "Runner acts in Back Alley. " +
            "The weather is light rain."
        };
      }
    },

    log(message) {
      if (!tracker.logMessages) {
        tracker.logMessages = [];
      }

      tracker.logMessages.push(message);
    },

    expected: {
      location,
      world,
      eventHistory
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("LOOK COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs the look action",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runLookCommand(
        player,
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );
      assert.deepStrictEqual(
        tracker.action,
        {
          type: "look"
        }
      );
    }
  );

  await test(
    "Does not print the raw location when narration succeeds",
    async () => {
      const tracker = {};

      await runLookCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.describedLocation,
        undefined
      );
    }
  );

  await test(
    "Prints raw output without narration in developer mode",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      services.presentationMode = "developer";

      await runLookCommand(
        createPlayer(),
        services
      );

      assert.strictEqual(
        tracker.describedLocation,
        services.expected.location
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        undefined
      );

      assert.strictEqual(
        tracker.worldWasLoaded,
        undefined
      );
    }
  );
  await test(
    "Loads world and event history for presentation",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runLookCommand(
        createPlayer(),
        services
      );

      assert.strictEqual(
        tracker.worldWasLoaded,
        true
      );
      assert.strictEqual(
        tracker.eventServicesWereLoaded,
        true
      );
      assert.strictEqual(
        tracker.presentationOptions.world,
        services.expected.world
      );
      assert.strictEqual(
        tracker.presentationOptions.eventHistory,
        services.expected.eventHistory
      );
    }
  );

  await test(
    "Builds a location narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runLookCommand(
        player,
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
      );
      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I look around."
      );
      assert.strictEqual(
        tracker.presentationOptions.mode,
        "describe_location"
      );
      assert.deepStrictEqual(
        tracker.presentationOptions.instructions,
        {
          preservePlayerAgency: true,
          useOnlyProvidedFacts: true
        }
      );
    }
  );

  await test(
    "Prints narration without raw location output",
    async () => {
      const tracker = {};

      await runLookCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "Runner acts in Back Alley. " +
            "The weather is light rain."
        ]
      );
    }
  );

  await test(
    "Awaits asynchronous narration",
    async () => {
      const tracker = {
        logMessages: []
      };

      await runLookCommand(
        createPlayer(),
        {
          presentationMode: "player",

          performAction() {
            return {
              success: true,
              message: "You look around.",
              data: {
                location: {
                  id: "back_alley_1",
                  name: "Back Alley"
                }
              }
            };
          },

          describeLocation() {},

          loadWorld() {
            return {
              id: "world_1",
              weather: "light rain"
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
          },

          log(message) {
            tracker.logMessages.push(message);
          }
        }
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "Asynchronous narration."
        ]
      );
    }
  );

  await test(
    "Falls back to the raw location when narration fails",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      services.presentationPipeline = {
        async present() {
          throw new Error(
            "Narration service unavailable."
          );
        }
      };

      await runLookCommand(
        createPlayer(),
        services
      );

      assert.strictEqual(
        tracker.describedLocation,
        services.expected.location
      );

      assert.strictEqual(
        tracker.logMessages,
        undefined
      );
    }
  );
  await test(
    "Prints action failures without presenting",
    async () => {
      const tracker = {
        presentationWasCalled: false,
        logMessages: []
      };

      await runLookCommand(
        createPlayer(),
        {
          performAction() {
            return {
              success: false,
              message:
                "You cannot look around.",
              data: {}
            };
          },

          presentationPipeline: {
            async present() {
              tracker.presentationWasCalled =
                true;
            }
          },

          log(message) {
            tracker.logMessages.push(message);
          }
        }
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        false
      );
      assert.deepStrictEqual(
        tracker.logMessages,
        ["You cannot look around."]
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
