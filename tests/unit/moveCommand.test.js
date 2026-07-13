"use strict";

const assert = require("assert");
const {
  runMoveCommand
} = require(
  "../../src/commands/handlers/moveCommand"
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
    id: "player_runner_1",
    name: "Runner",
    location: "back_alley_1"
  };
}

function createServices(tracker = {}) {
  const location = {
    id: "safehouse_1",
    name: "Safehouse 1"
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

  const eventServices = {
    eventHistory,
    eventRecorder: {
      record() {
        return null;
      }
    }
  };

  return {
    performAction(player, action, actionServices) {
      tracker.actionPlayer = player;
      tracker.action = action;
      tracker.actionServices = actionServices;

      player.location = location.id;

      return {
        success: true,
        message: "You move to Safehouse 1.",
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
      return eventServices;
    },

    presentationPipeline: {
      async present(options) {
        tracker.presentationOptions = options;

        return {
          narration:
            "Runner arrives at Safehouse 1."
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
      eventHistory,
      eventServices
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("MOVE COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs the move action",
    async () => {
      const tracker = {};
      const player = createPlayer();
      const services = createServices(tracker);

      await runMoveCommand(
        player,
        ["safehouse"],
        services
      );

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );
      assert.deepStrictEqual(
        tracker.action,
        {
          type: "move",
          exit: "safehouse"
        }
      );
      assert.strictEqual(
        tracker.actionServices,
        services.expected.eventServices
      );
    }
  );

  await test(
    "Preserves movement output",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runMoveCommand(
        createPlayer(),
        ["safehouse"],
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 2),
        [
          "You move to Safehouse 1.",
          ""
        ]
      );
      assert.strictEqual(
        tracker.describedLocation,
        services.expected.location
      );
    }
  );

  await test(
    "Uses world and event history for presentation",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runMoveCommand(
        createPlayer(),
        ["safehouse"],
        services
      );

      assert.strictEqual(
        tracker.eventServicesWereLoaded,
        true
      );
      assert.strictEqual(
        tracker.worldWasLoaded,
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
    "Builds a movement narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runMoveCommand(
        player,
        ["safehouse"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
      );
      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I move through safehouse."
      );
      assert.strictEqual(
        tracker.presentationOptions.mode,
        "narrate_action"
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
    "Prints narration after location output",
    async () => {
      const tracker = {};

      await runMoveCommand(
        createPlayer(),
        ["safehouse"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(-2),
        [
          "",
          "Runner arrives at Safehouse 1."
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

      await runMoveCommand(
        createPlayer(),
        ["safehouse"],
        {
          getEventServices() {
            return {
              eventHistory: null
            };
          },

          performAction(player) {
            player.location = "safehouse_1";

            return {
              success: true,
              message: "You move to Safehouse 1.",
              data: {
                location: {
                  id: "safehouse_1",
                  name: "Safehouse 1"
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

          presentationPipeline: {
            async present() {
              await Promise.resolve();

              return {
                narration:
                  "Asynchronous movement narration."
              };
            }
          },

          log(message) {
            tracker.logMessages.push(message);
          }
        }
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(-2),
        [
          "",
          "Asynchronous movement narration."
        ]
      );
    }
  );

  await test(
    "Does not present failed movement",
    async () => {
      const tracker = {
        locationWasDescribed: false,
        worldWasLoaded: false,
        presentationWasCalled: false,
        logMessages: []
      };

      await runMoveCommand(
        createPlayer(),
        ["unknown"],
        {
          getEventServices() {
            return {};
          },

          performAction() {
            return {
              success: false,
              message: "You cannot go that way.",
              data: {}
            };
          },

          describeLocation() {
            tracker.locationWasDescribed = true;
          },

          loadWorld() {
            tracker.worldWasLoaded = true;
            return {};
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
        tracker.locationWasDescribed,
        false
      );
      assert.strictEqual(
        tracker.worldWasLoaded,
        false
      );
      assert.strictEqual(
        tracker.presentationWasCalled,
        false
      );
      assert.deepStrictEqual(
        tracker.logMessages,
        ["You cannot go that way."]
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
