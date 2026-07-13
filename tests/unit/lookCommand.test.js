"use strict";

const assert = require("assert");
const {
  runLookCommand
} = require(
  "../../src/commands/handlers/lookCommand"
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
    id: "player_1",
    name: "Runner",
    location: "back_alley_1"
  };
}

function createServices(tracker = {}) {
  const location = {
    id: "back_alley_1",
    name: "Back Alley"
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
        message: "You look around.",
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

      return {
        eventHistory
      };
    },

    presentationPipeline: {
      present(options) {
        tracker.presentationOptions =
          options;

        return {
          narration:
            "Runner acts in Back Alley. " +
            "The weather is light rain."
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
      eventHistory
    }
  };
}

console.log("================================");
console.log("LOOK COMMAND TESTS");
console.log("================================");
console.log("");

test("Performs the look action", () => {
  const tracker = {};
  const player = createPlayer();

  runLookCommand(
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
      type: "look"
    }
  );
});

test("Preserves the detailed location description", () => {
  const tracker = {};
  const services = createServices(tracker);

  runLookCommand(
    createPlayer(),
    services
  );

  assert.strictEqual(
    tracker.describedLocation,
    services.expected.location
  );
});

test("Loads world and event history for presentation", () => {
  const tracker = {};
  const services = createServices(tracker);

  runLookCommand(
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
});

test("Builds a location narration request", () => {
  const tracker = {};
  const player = createPlayer();

  runLookCommand(
    player,
    createServices(tracker)
  );

  assert.strictEqual(
    tracker.presentationOptions.player,
    player
  );
  assert.strictEqual(
    tracker.presentationOptions.playerInput,
    "I look around."
  );
  assert.strictEqual(
    tracker.presentationOptions.mode,
    "describe_location"
  );
  assert.deepStrictEqual(
    tracker.presentationOptions.instructions,
    {
      preservePlayerAgency: true,
      useOnlyProvidedFacts: true
    }
  );
});

test("Prints narration after the existing output", () => {
  const tracker = {};

  runLookCommand(
    createPlayer(),
    createServices(tracker)
  );

  assert.deepStrictEqual(
    tracker.logMessages,
    [
      "",
      "Runner acts in Back Alley. " +
        "The weather is light rain."
    ]
  );
});

test("Prints action failures without presenting", () => {
  const tracker = {
    presentationWasCalled: false,
    logMessages: []
  };

  runLookCommand(
    createPlayer(),
    {
      performAction() {
        return {
          success: false,
          message: "You cannot look around.",
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
    ["You cannot look around."]
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
