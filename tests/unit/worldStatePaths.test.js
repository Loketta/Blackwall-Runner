"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_WORLD_ID,
  getWorldDirectory,
  getWorldStateDirectory,
  getWorldStateFilePath
} = require(
  "../../src/game/world/worldStatePaths"
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
console.log("WORLD STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default development world",
  () => {
    assert.strictEqual(
      DEFAULT_WORLD_ID,
      "development-world"
    );
  }
);

test(
  "Builds the default world directory",
  () => {
    assert.strictEqual(
      getWorldDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world"
      )
    );
  }
);

test(
  "Builds the world state directory",
  () => {
    assert.strictEqual(
      getWorldStateDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state"
      )
    );
  }
);

test(
  "Builds the world state file path",
  () => {
    assert.strictEqual(
      getWorldStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "world.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getWorldStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "world.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getWorldStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "world.json"
      )
    );
  }
);

test(
  "Rejects an empty world identifier",
  () => {
    assert.throws(
      () => getWorldDirectory({
        worldId: ""
      }),
      /worldId must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe world identifier",
  () => {
    assert.throws(
      () => getWorldDirectory({
        worldId: "../unsafe"
      }),
      /worldId may contain only/
    );
  }
);

test(
  "Rejects an empty saves directory",
  () => {
    assert.throws(
      () => getWorldDirectory({
        savesDirectory: ""
      }),
      /savesDirectory must be a non-empty string/
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
