"use strict";

const assert = require("assert");
const {
  runDropCommand
} = require(
  "../../src/commands/handlers/dropCommand"
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
        message: "You drop the item.",
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
      present(options) {
        tracker.presentationOptions = options;

        return {
          narration: "Runner releases the item."
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

console.log("================================");
console.log("DROP COMMAND TESTS");
console.log("================================");
console.log("");

test("Performs a ground drop action", () => {
  const tracker = {};
  const player = createPlayer();
  const services = createServices(tracker);

  runDropCommand(
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
      type: "drop",
      itemInput: "Medkit"
    }
  );
  assert.strictEqual(
    tracker.actionServices,
    services.expected.eventServices
  );
});

test("Performs a container drop action", () => {
  const tracker = {};
  const services = createServices(tracker);

  runDropCommand(
    createPlayer(),
    ["Medkit", "into", "Storage", "Crate"],
    services
  );

  assert.deepStrictEqual(
    tracker.action,
    {
      type: "dropIntoContainer",
      itemInput: "Medkit",
      containerInput: "Storage Crate"
    }
  );
  assert.strictEqual(
    tracker.actionServices,
    services.expected.eventServices
  );
});

test("Rejects incomplete container syntax", () => {
  const tracker = {};

  runDropCommand(
    createPlayer(),
    ["Medkit", "into"],
    createServices(tracker)
  );

  assert.deepStrictEqual(
    tracker.logMessages,
    ["Use: drop <item> into <container>"]
  );
  assert.strictEqual(tracker.action, undefined);
});

test("Builds a ground drop narration request", () => {
  const tracker = {};
  const services = createServices(tracker);

  runDropCommand(
    createPlayer(),
    ["Medkit"],
    services
  );

  assert.strictEqual(
    tracker.presentationOptions.playerInput,
    "I drop Medkit."
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

test("Builds a container drop narration request", () => {
  const tracker = {};

  runDropCommand(
    createPlayer(),
    ["Medkit", "into", "Storage", "Crate"],
    createServices(tracker)
  );

  assert.strictEqual(
    tracker.presentationOptions.playerInput,
    "I place Medkit into Storage Crate."
  );
});

test("Prints narration after action output", () => {
  const tracker = {};

  runDropCommand(
    createPlayer(),
    ["Medkit"],
    createServices(tracker)
  );

  assert.deepStrictEqual(
    tracker.logMessages,
    [
      "You drop the item.",
      "",
      "Runner releases the item."
    ]
  );
});

test("Does not present failed drop actions", () => {
  const tracker = {
    worldWasLoaded: false,
    presentationWasCalled: false,
    logMessages: []
  };

  runDropCommand(
    createPlayer(),
    ["Unknown"],
    {
      getEventServices() {
        return {};
      },
      performAction() {
        return {
          success: false,
          message: "You do not have that item.",
          data: {}
        };
      },
      loadWorld() {
        tracker.worldWasLoaded = true;
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
    tracker.presentationWasCalled,
    false
  );
  assert.deepStrictEqual(
    tracker.logMessages,
    ["You do not have that item."]
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
