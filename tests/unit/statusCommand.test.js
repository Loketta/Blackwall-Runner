"use strict";

const assert = require("assert");
const {
  runStatusCommand
} = require(
  "../../src/commands/handlers/statusCommand"
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
    name: "Runner",
    role: "Solo",
    health: 35,
    credits: 1200,
    location: "back_alley_1"
  };
}

function createServices(tracker = {}) {
  const world = {
    day: 4,
    currentTime: "21:30",
    weather: "light rain"
  };

  const eventHistory = {
    getRecent() {
      return [];
    }
  };

  return {
    performAction(player, action, actionServices) {
      tracker.actionPlayer = player;
      tracker.action = action;
      tracker.actionServices = actionServices;

      return {
        success: true,
        message: "You check your status.",
        data: {
          status: {
            name: player.name,
            role: player.role,
            health: player.health,
            credits: player.credits,
            location: player.location
          },
          world
        }
      };
    },

    actionServices: {
      loadWorld() {
        return world;
      }
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
        tracker.presentationOptions = options;

        return {
          narration:
            "Runner reviews their current condition."
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
  console.log("STATUS COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs the status action",
    async () => {
      const tracker = {};
      const player = createPlayer();
      const services = createServices(tracker);

      await runStatusCommand(player, services);

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );
      assert.deepStrictEqual(
        tracker.action,
        {
          type: "status"
        }
      );
      assert.strictEqual(
        tracker.actionServices,
        services.actionServices
      );
    }
  );

  await test(
    "Preserves detailed status output",
    async () => {
      const tracker = {};

      await runStatusCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(0, 9),
        [
          "=== PLAYER STATUS ===",
          "Name: Runner",
          "Role: Solo",
          "Health: 35",
          "Credits: 1200",
          "Location: back_alley_1",
          "Day: 4",
          "Time: 21:30",
          "Weather: light rain"
        ]
      );
    }
  );

  await test(
    "Builds a status narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();
      const services = createServices(tracker);

      await runStatusCommand(player, services);

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
        "I check my status."
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
    "Prints narration after status output",
    async () => {
      const tracker = {};

      await runStatusCommand(
        createPlayer(),
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages.slice(-2),
        [
          "",
          "Runner reviews their current condition."
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

      await runStatusCommand(
        createPlayer(),
        {
          performAction() {
            return {
              success: true,
              message: "You check your status.",
              data: {
                status: {
                  name: "Runner",
                  role: "Solo",
                  health: 35,
                  credits: 1200,
                  location: "back_alley_1"
                },
                world: {
                  day: 4,
                  currentTime: "21:30",
                  weather: "light rain"
                }
              }
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
                  "Asynchronous status narration."
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
          "Asynchronous status narration."
        ]
      );
    }
  );

  await test(
    "Uses detailed status output in developer mode",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      services.presentationMode =
        "developer";

      await runStatusCommand(
        createPlayer(),
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "=== PLAYER STATUS ===",
          "Name: Runner",
          "Role: Solo",
          "Health: 35",
          "Credits: 1200",
          "Location: back_alley_1",
          "Day: 4",
          "Time: 21:30",
          "Weather: light rain"
        ]
      );

      assert.strictEqual(
        tracker.presentationOptions,
        undefined
      );

      assert.strictEqual(
        tracker.eventServicesWereLoaded,
        undefined
      );
    }
  );

  await test(
    "Falls back when status narration fails",
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

      await runStatusCommand(
        createPlayer(),
        services
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "=== PLAYER STATUS ===",
          "Name: Runner",
          "Role: Solo",
          "Health: 35",
          "Credits: 1200",
          "Location: back_alley_1",
          "Day: 4",
          "Time: 21:30",
          "Weather: light rain"
        ]
      );
    }
  );
  await test(
    "Prints failures without presenting",
    async () => {
      const tracker = {
        presentationWasCalled: false,
        logMessages: []
      };

      await runStatusCommand(
        createPlayer(),
        {
          performAction() {
            return {
              success: false,
              message: "Status is unavailable.",
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
        ["Status is unavailable."]
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
