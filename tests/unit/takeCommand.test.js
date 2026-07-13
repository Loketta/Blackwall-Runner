"use strict";

const assert = require("assert");
const {
  runTakeCommand
} = require(
  "../../src/commands/handlers/takeCommand"
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

      return {
        success: true,
        message: "You take the item.",
        data: {}
      };
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
          narration: "Runner secures the item."
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
      world,
      eventHistory,
      eventServices
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("TAKE COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs a ground take action",
    async () => {
      const tracker = {};
      const player = createPlayer();
      const services = createServices(tracker);

      await runTakeCommand(
        player,
        ["Medkit"],
        services
      );

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );

      assert.deepStrictEqual(
        tracker.action,
        {
          type: "take",
          itemInput: "Medkit"
        }
      );

      assert.strictEqual(
        tracker.actionServices,
        services.expected.eventServices
      );
    }
  );

  await test(
    "Performs a container take action",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runTakeCommand(
        createPlayer(),
        ["Medkit", "from", "Storage", "Crate"],
        services
      );

      assert.deepStrictEqual(
        tracker.action,
        {
          type: "takeFromContainer",
          itemInput: "Medkit",
          containerInput: "Storage Crate"
        }
      );

      assert.strictEqual(
        tracker.actionServices,
        services.expected.eventServices
      );
    }
  );

  await test(
    "Rejects incomplete container syntax",
    async () => {
      const tracker = {};

      await runTakeCommand(
        createPlayer(),
        ["Medkit", "from"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        ["Use: take <item> from <container>"]
      );

      assert.strictEqual(
        tracker.action,
        undefined
      );
    }
  );

  await test(
    "Builds a ground take narration request",
    async () => {
      const tracker = {};
      const services = createServices(tracker);
      const player = createPlayer();

      await runTakeCommand(
        player,
        ["Medkit"],
        services
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
      );

      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I take Medkit."
      );

      assert.strictEqual(
        tracker.presentationOptions.world,
        services.expected.world
      );

      assert.strictEqual(
        tracker.presentationOptions.eventHistory,
        services.expected.eventHistory
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
    "Builds a container take narration request",
    async () => {
      const tracker = {};

      await runTakeCommand(
        createPlayer(),
        ["Medkit", "from", "Storage", "Crate"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I take Medkit from Storage Crate."
      );
    }
  );

  await test(
    "Prints narration after action output",
    async () => {
      const tracker = {};

      await runTakeCommand(
        createPlayer(),
        ["Medkit"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "You take the item.",
          "",
          "Runner secures the item."
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

      await runTakeCommand(
        createPlayer(),
        ["Medkit"],
        {
          getEventServices() {
            return {
              eventHistory: null
            };
          },

          performAction() {
            return {
              success: true,
              message: "You take the item.",
              data: {}
            };
          },

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
                  "Asynchronous take narration."
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
          "You take the item.",
          "",
          "Asynchronous take narration."
        ]
      );
    }
  );

  await test(
    "Does not present failed take actions",
    async () => {
      const tracker = {
        worldWasLoaded: false,
        presentationWasCalled: false,
        logMessages: []
      };

      await runTakeCommand(
        createPlayer(),
        ["Unknown"],
        {
          getEventServices() {
            return {};
          },

          performAction() {
            return {
              success: false,
              message:
                "I do not recognise that item.",
              data: {}
            };
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
        tracker.worldWasLoaded,
        false
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        false
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        ["I do not recognise that item."]
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
