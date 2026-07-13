"use strict";

const assert = require("assert");
const {
  runTalkCommand
} = require(
  "../../src/commands/handlers/talkCommand"
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
  const npc = {
    id: "npc_finch",
    name: "Finch",
    dialogue: "Keep your voice down."
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
        message: npc.dialogue,
        data: {
          npc
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
            "Finch watches the alley carefully."
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
      npc,
      world,
      eventHistory
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("TALK COMMAND TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Performs the talk action",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runTalkCommand(
        player,
        ["Finch"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.actionPlayer,
        player
      );

      assert.deepStrictEqual(
        tracker.action,
        {
          type: "talk",
          npcInput: "Finch"
        }
      );
    }
  );

  await test(
    "Joins multi-word NPC input",
    async () => {
      const tracker = {};

      await runTalkCommand(
        createPlayer(),
        ["Doctor", "Vale"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.action.npcInput,
        "Doctor Vale"
      );
    }
  );

  await test(
    "Preserves authoritative NPC dialogue",
    async () => {
      const tracker = {};

      await runTalkCommand(
        createPlayer(),
        ["Finch"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.logMessages[0],
        "Keep your voice down."
      );
    }
  );

  await test(
    "Uses world and event history for presentation",
    async () => {
      const tracker = {};
      const services = createServices(tracker);

      await runTalkCommand(
        createPlayer(),
        ["Finch"],
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
    "Builds a talk narration request",
    async () => {
      const tracker = {};
      const player = createPlayer();

      await runTalkCommand(
        player,
        ["Finch"],
        createServices(tracker)
      );

      assert.strictEqual(
        tracker.presentationOptions.player,
        player
      );

      assert.strictEqual(
        tracker.presentationOptions.playerInput,
        "I talk to Finch."
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
    "Prints narration after dialogue",
    async () => {
      const tracker = {};

      await runTalkCommand(
        createPlayer(),
        ["Finch"],
        createServices(tracker)
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        [
          "Keep your voice down.",
          "",
          "Finch watches the alley carefully."
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

      await runTalkCommand(
        createPlayer(),
        ["Finch"],
        {
          performAction() {
            return {
              success: true,
              message: "Keep your voice down.",
              data: {
                npc: {
                  id: "npc_finch",
                  name: "Finch"
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

          presentationPipeline: {
            async present() {
              await Promise.resolve();

              return {
                narration:
                  "Asynchronous talk narration."
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
          "Keep your voice down.",
          "",
          "Asynchronous talk narration."
        ]
      );
    }
  );

  await test(
    "Does not present failed talk actions",
    async () => {
      const tracker = {
        worldWasLoaded: false,
        eventServicesWereLoaded: false,
        presentationWasCalled: false,
        logMessages: []
      };

      await runTalkCommand(
        createPlayer(),
        ["Unknown"],
        {
          performAction() {
            return {
              success: false,
              message:
                "I do not recognise that person.",
              data: {}
            };
          },

          loadWorld() {
            tracker.worldWasLoaded = true;
            return {};
          },

          getEventServices() {
            tracker.eventServicesWereLoaded = true;
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
        tracker.eventServicesWereLoaded,
        false
      );

      assert.strictEqual(
        tracker.presentationWasCalled,
        false
      );

      assert.deepStrictEqual(
        tracker.logMessages,
        ["I do not recognise that person."]
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
