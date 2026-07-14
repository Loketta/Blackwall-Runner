"use strict";

const assert = require("assert");
const {
  runOpenCommand
} = require(
  "../../src/commands/handlers/openCommand"
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
  const container = {
    id: "container_crate_1",
    name: "Storage Crate",
    items: ["item_medkit", "item_unknown"]
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
        message: "You open Storage Crate.",
        data: {
          container
        }
      };
    },

    loadItem(itemId) {
      if (itemId === "item_medkit") {
        return {
          id: itemId,
          name: "Medkit"
        };
      }

      return null;
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
        tracker.presentationOptions = options;

        return {
          narration:
            "The crate opens with a metallic scrape."
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
      eventHistory
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("OPEN COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Requires container input",
    async () => {
      const tracker = {};

      await runOpenCommand(
        createPlayer(),
        [],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        ["What do you want to open?"]
      );

      assert.strictEqual(
        tracker.action,
        undefined
      );
    }
  );

  await test(
    "Performs the open action",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runOpenCommand(
        player,
        ["Storage", "Crate"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );

      assert.deepStrictEqual(
        tracker.action,
        {
          type: "open",
          containerInput: "Storage Crate"
        }
      );
    }
  );

  await test(
    "Preserves container contents output",
    async () => {
      const tracker = {};

      await runOpenCommand(
        createPlayer(),
        ["Storage", "Crate"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 5),
        [
          "You open Storage Crate.",
          "",
          "Contents:",
          "- Medkit",
          "- Unknown Item (item_unknown)"
        ]
      );
    }
  );

  await test(
    "Preserves empty container output",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      services.performAction = function () {
        return {
          success: true,
          message: "You open Empty Box.",
          data: {
            container: {
              id: "container_empty",
              name: "Empty Box",
              items: []
            }
          }
        };
      };

      await runOpenCommand(
        createPlayer(),
        ["Empty", "Box"],
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 2),
        [
          "You open Empty Box.",
          "It is empty."
        ]
      );
    }
  );

  await test(
    "Builds an open narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();
      const services = createServices(tracker);

      await runOpenCommand(
        player,
        ["Storage", "Crate"],
        services
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
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
        tracker.presentationOptions.playerInput,
        "I open Storage Crate."
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
    "Prints narration after contents",
    async () => {
      const tracker = {};

      await runOpenCommand(
        createPlayer(),
        ["Storage", "Crate"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(-2),
        [
          "",
          "The crate opens with a metallic scrape."
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

      await runOpenCommand(
        createPlayer(),
        ["Storage", "Crate"],
        {
          performAction() {
            return {
              success: true,
              message: "You open Storage Crate.",
              data: {
                container: {
                  id: "container_crate_1",
                  name: "Storage Crate",
                  items: []
                }
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

          presentationMode: "player",

          presentationPipeline: {
            async present() {
              await Promise.resolve();

              return {
                narration:
                  "Asynchronous open narration."
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
          "Asynchronous open narration."
        ]
      );
    }
  );

  await test(
    "Uses mechanical output in developer mode",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      services.presentationMode =
        "developer";

      await runOpenCommand(
        createPlayer(),
        ["Storage", "Crate"],
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "You open Storage Crate.",
          "",
          "Contents:",
          "- Medkit",
          "- Unknown Item (item_unknown)"
        ]
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        undefined
      );

      assert.strictEqual(
        tracker.worldWasLoaded,
        undefined
      );

      assert.strictEqual(
        tracker.eventServicesWereLoaded,
        undefined
      );
    }
  );

  await test(
    "Falls back when open narration fails",
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

      await runOpenCommand(
        createPlayer(),
        ["Storage", "Crate"],
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "You open Storage Crate.",
          "",
          "Contents:",
          "- Medkit",
          "- Unknown Item (item_unknown)"
        ]
      );
    }
  );

  await test(
    "Does not present failed open actions",
    async () => {
      const tracker = {
        worldWasLoaded: false,
        presentationWasCalled: false,
        logMessages: []
      };

      await runOpenCommand(
        createPlayer(),
        ["Unknown"],
        {
          performAction() {
            return {
              success: false,
              message:
                "I do not recognise that container.",
              data: {}
            };
          },

          loadWorld() {
            tracker.worldWasLoaded = true;
            return {};
          },

          presentationMode: "player",

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
        ["I do not recognise that container."]
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
