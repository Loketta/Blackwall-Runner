"use strict";

const assert = require("assert");
const {
  runInventoryCommand
} = require(
  "../../src/commands/handlers/inventoryCommand"
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

function createServices(
  tracker = {},
  inventory = [
    {
      id: "item_medkit_1",
      name: "Medkit"
    },
    {
      id: "item_pistol_1",
      name: "Heavy Pistol"
    }
  ]
) {
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
        message: "You check your inventory.",
        data: {
          inventory
        }
      };
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

    presentationPipeline: {
      async present(options) {
        tracker.presentationOptions = options;

        return {
          narration:
            "Runner reviews their carried equipment."
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
      inventory
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("INVENTORY COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs the inventory action",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runInventoryCommand(
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
          type: "inventory"
        }
      );
    }
  );

  await test(
    "Prints inventory contents",
    async () => {
      const tracker = {};

      await runInventoryCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 3),
        [
          "=== INVENTORY ===",
          "- Medkit",
          "- Heavy Pistol"
        ]
      );
    }
  );

  await test(
    "Prints an empty inventory",
    async () => {
      const tracker = {};

      await runInventoryCommand(
        createPlayer(),
        createServices(tracker, [])
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 2),
        [
          "=== INVENTORY ===",
          "Your inventory is empty."
        ]
      );
    }
  );

  await test(
    "Loads world and event history for presentation",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runInventoryCommand(
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
    "Builds an inventory narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runInventoryCommand(
        player,
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
      );

      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I check my inventory."
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
    "Prints narration after inventory output",
    async () => {
      const tracker = {};

      await runInventoryCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(-2),
        [
          "",
          "Runner reviews their carried equipment."
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

      await runInventoryCommand(
        createPlayer(),
        {
          performAction() {
            return {
              success: true,
              message: "You check your inventory.",
              data: {
                inventory: []
              }
            };
          },

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
                  "Asynchronous inventory narration."
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
          "Asynchronous inventory narration."
        ]
      );
    }
  );

  await test(
    "Prints failures without presenting",
    async () => {
      const tracker = {
        presentationWasCalled: false,
        worldWasLoaded: false,
        logMessages: []
      };

      await runInventoryCommand(
        createPlayer(),
        {
          performAction() {
            return {
              success: false,
              message: "Inventory is unavailable.",
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
        ["Inventory is unavailable."]
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
