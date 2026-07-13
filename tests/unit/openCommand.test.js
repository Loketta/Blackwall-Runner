"use strict";

const assert = require("assert");
const {
  runOpenCommand
} = require(
  "../../src/commands/handlers/openCommand"
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

    presentationPipeline: {
      present(options) {
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

console.log("================================");
console.log("OPEN COMMAND TESTS");
console.log("================================");
console.log("");

test("Requires container input", () => {
  const tracker = {};

  runOpenCommand(
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
});

test("Performs the open action", () => {
  const tracker = {};
  const player = createPlayer();

  runOpenCommand(
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
});

test("Preserves container contents output", () => {
  const tracker = {};

  runOpenCommand(
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
});

test("Preserves empty container output", () => {
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

  runOpenCommand(
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
});

test("Builds an open narration request", () => {
  const tracker = {};
  const player = createPlayer();
  const services = createServices(tracker);

  runOpenCommand(
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
});

test("Prints narration after contents", () => {
  const tracker = {};

  runOpenCommand(
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
});

test("Does not present failed open actions", () => {
  const tracker = {
    worldWasLoaded: false,
    presentationWasCalled: false,
    logMessages: []
  };

  runOpenCommand(
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
    ["I do not recognise that container."]
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
