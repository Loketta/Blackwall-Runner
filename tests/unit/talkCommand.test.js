"use strict";

const assert = require("assert");
const {
  runTalkCommand
} = require(
  "../../src/commands/handlers/talkCommand"
);

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
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
      present(options) {
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

console.log("================================");
console.log("TALK COMMAND TESTS");
console.log("================================");
console.log("");

test("Performs the talk action", () => {
  const tracker = {};
  const player = createPlayer();

  runTalkCommand(
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
});

test("Joins multi-word NPC input", () => {
  const tracker = {};

  runTalkCommand(
    createPlayer(),
    ["Doctor", "Vale"],
    createServices(tracker)
  );

  assert.strictEqual(
    tracker.action.npcInput,
    "Doctor Vale"
  );
});

test("Preserves authoritative NPC dialogue", () => {
  const tracker = {};

  runTalkCommand(
    createPlayer(),
    ["Finch"],
    createServices(tracker)
  );

  assert.strictEqual(
    tracker.logMessages[0],
    "Keep your voice down."
  );
});

test("Uses world and event history for presentation", () => {
  const tracker = {};
  const services = createServices(tracker);

  runTalkCommand(
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
});

test("Builds a talk narration request", () => {
  const tracker = {};
  const player = createPlayer();

  runTalkCommand(
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
});

test("Prints narration after dialogue", () => {
  const tracker = {};

  runTalkCommand(
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
});

test("Does not present failed talk actions", () => {
  const tracker = {
    worldWasLoaded: false,
    eventServicesWereLoaded: false,
    presentationWasCalled: false,
    logMessages: []
  };

  runTalkCommand(
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
        present() {
          tracker.presentationWasCalled = true;
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
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
