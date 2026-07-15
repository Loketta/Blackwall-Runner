"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_NPCS_FILE,
  getNpcsDirectory,
  getNpcStateFilePath
} = require(
  "../../src/game/world/npcStatePaths"
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
console.log("NPC STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default NPCs file",
  () => {
    assert.strictEqual(
      DEFAULT_NPCS_FILE,
      "npcs.json"
    );
  }
);

test(
  "Builds the default NPCs directory",
  () => {
    assert.strictEqual(
      getNpcsDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "npcs"
      )
    );
  }
);

test(
  "Builds the default NPC state path",
  () => {
    assert.strictEqual(
      getNpcStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "npcs",
        "npcs.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getNpcStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "npcs",
        "npcs.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getNpcStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "npcs",
        "npcs.json"
      )
    );
  }
);

test(
  "Supports a custom NPCs file",
  () => {
    assert.strictEqual(
      getNpcStateFilePath({
        npcsFile: "characters.json"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "npcs",
        "characters.json"
      )
    );
  }
);

test(
  "Rejects an empty NPCs file",
  () => {
    assert.throws(
      () => getNpcStateFilePath({
        npcsFile: ""
      }),
      /npcsFile must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe NPCs file",
  () => {
    assert.throws(
      () => getNpcStateFilePath({
        npcsFile: "../npcs.json"
      }),
      /npcsFile contains invalid path characters/
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