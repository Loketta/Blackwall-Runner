"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_WORLD_OBJECTS_FILE,
  getWorldObjectsDirectory,
  getWorldObjectStateFilePath
} = require(
  "../../src/game/world/worldObjectStatePaths"
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
console.log("WORLD OBJECT STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default world objects file",
  () => {
    assert.strictEqual(
      DEFAULT_WORLD_OBJECTS_FILE,
      "worldObjects.json"
    );
  }
);

test(
  "Builds the default world objects directory",
  () => {
    assert.strictEqual(
      getWorldObjectsDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "worldObjects"
      )
    );
  }
);

test(
  "Builds the default world object state path",
  () => {
    assert.strictEqual(
      getWorldObjectStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "worldObjects",
        "worldObjects.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getWorldObjectStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "worldObjects",
        "worldObjects.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getWorldObjectStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "worldObjects",
        "worldObjects.json"
      )
    );
  }
);

test(
  "Supports a custom world objects file",
  () => {
    assert.strictEqual(
      getWorldObjectStateFilePath({
        worldObjectsFile: "objects.json"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "worldObjects",
        "objects.json"
      )
    );
  }
);

test(
  "Rejects an empty world objects file",
  () => {
    assert.throws(
      () => getWorldObjectStateFilePath({
        worldObjectsFile: ""
      }),
      /worldObjectsFile must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe world objects file",
  () => {
    assert.throws(
      () => getWorldObjectStateFilePath({
        worldObjectsFile: "../worldObjects.json"
      }),
      /worldObjectsFile contains invalid path characters/
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