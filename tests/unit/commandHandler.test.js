"use strict";

const assert = require("assert");

const statusModule = require(
  "../../src/commands/handlers/statusCommand"
);
const lookModule = require(
  "../../src/commands/handlers/lookCommand"
);

const originalStatusCommand =
  statusModule.runStatusCommand;
const originalLookCommand =
  lookModule.runLookCommand;

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

async function loadHandlerWithStubs({
  runStatusCommand =
    originalStatusCommand,
  runLookCommand =
    originalLookCommand
} = {}) {
  statusModule.runStatusCommand =
    runStatusCommand;
  lookModule.runLookCommand =
    runLookCommand;

  const modulePath = require.resolve(
    "../../src/commands/commandHandler"
  );

  delete require.cache[modulePath];

  return require(modulePath);
}

async function runTests() {
  console.log("================================");
  console.log("COMMAND HANDLER TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Injects the shared presentation pipeline",
    async () => {
      const player = {
        id: "player_runner_1"
      };

      const pipeline = {
        async present() {},
        getMetrics() {
          return {};
        }
      };

      const tracker = {};

      const {
        handleCommand
      } = await loadHandlerWithStubs({
        async runLookCommand(
          receivedPlayer,
          services
        ) {
          tracker.player = receivedPlayer;
          tracker.services = services;
        }
      });

      await handleCommand(
        "look",
        [],
        {
          loadPlayer() {
            return player;
          },
          presentationPipeline: pipeline
        }
      );

      assert.strictEqual(
        tracker.player,
        player
      );

      assert.strictEqual(
        tracker.services.presentationPipeline,
        pipeline
      );
    }
  );

  await test(
    "Loads the player once",
    async () => {
      let loadCount = 0;

      const {
        handleCommand
      } = await loadHandlerWithStubs({
        async runStatusCommand() {}
      });

      await handleCommand(
        "status",
        [],
        {
          loadPlayer() {
            loadCount += 1;

            return {
              id: "player_runner_1"
            };
          },
          presentationPipeline: {
            async present() {},
            getMetrics() {
              return {};
            }
          }
        }
      );

      assert.strictEqual(
        loadCount,
        1
      );
    }
  );

  await test(
    "Prints help for unknown commands",
    async () => {
      const messages = [];

      const {
        handleCommand
      } = await loadHandlerWithStubs();

      await handleCommand(
        "unknown",
        [],
        {
          loadPlayer() {
            return {
              id: "player_runner_1"
            };
          },
          log(message) {
            messages.push(message);
          }
        }
      );

      assert.strictEqual(
        messages[0],
        "Unknown command."
      );

      assert.ok(
        messages.includes("look")
      );

      assert.ok(
        messages.includes("open <container>")
      );
    }
  );

  statusModule.runStatusCommand =
    originalStatusCommand;
  lookModule.runLookCommand =
    originalLookCommand;

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
  statusModule.runStatusCommand =
    originalStatusCommand;
  lookModule.runLookCommand =
    originalLookCommand;

  console.error(error);
  process.exitCode = 1;
});
