"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_PLAYER_FILE,
  getPlayersDirectory,
  getPlayerStateFilePath
} = require(
  "../../src/game/world/playerStatePaths"
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

console.log("================================");
console.log("PLAYER STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default player file",
  () => {
    assert.strictEqual(
      DEFAULT_PLAYER_FILE,
      "runner.json"
    );
  }
);

test(
  "Builds the default players directory",
  () => {
    assert.strictEqual(
      getPlayersDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "players"
      )
    );
  }
);

test(
  "Builds the default player state path",
  () => {
    assert.strictEqual(
      getPlayerStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "players",
        "runner.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getPlayerStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "players",
        "runner.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getPlayerStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "players",
        "runner.json"
      )
    );
  }
);

test(
  "Supports a custom player file",
  () => {
    assert.strictEqual(
      getPlayerStateFilePath({
        playerFile: "player-2.json"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "players",
        "player-2.json"
      )
    );
  }
);

test(
  "Rejects an empty player file",
  () => {
    assert.throws(
      () => getPlayerStateFilePath({
        playerFile: ""
      }),
      /playerFile must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe player file",
  () => {
    assert.throws(
      () => getPlayerStateFilePath({
        playerFile: "../runner.json"
      }),
      /playerFile contains invalid path characters/
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
