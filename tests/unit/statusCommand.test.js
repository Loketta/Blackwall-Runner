"use strict";

const assert = require("assert");
const {
  runStatusCommand
} = require(
  "../../src/commands/handlers/statusCommand"
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

    presentationPipeline: {
      present(options) {
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

console.log("================================");
console.log("STATUS COMMAND TESTS");
console.log("================================");
console.log("");

test("Performs the status action", () => {
  const tracker = {};
  const player = createPlayer();
  const services = createServices(tracker);

  runStatusCommand(player, services);

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
});

test("Preserves detailed status output", () => {
  const tracker = {};

  runStatusCommand(
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
});

test("Builds a status narration request", () => {
  const tracker = {};
  const player = createPlayer();
  const services = createServices(tracker);

  runStatusCommand(player, services);

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
});

test("Prints narration after status output", () => {
  const tracker = {};

  runStatusCommand(
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
});

test("Prints failures without presenting", () => {
  const tracker = {
    presentationWasCalled: false,
    logMessages: []
  };

  runStatusCommand(
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
    tracker.presentationWasCalled,
    false
  );
  assert.deepStrictEqual(
    tracker.logMessages,
    ["Status is unavailable."]
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
