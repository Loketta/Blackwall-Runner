"use strict";

const assert = require("assert");
const path = require("path");
const {
  getLocationStateDirectory,
  getLocationStateFilePath
} = require(
  "../../src/game/world/locationStatePaths"
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
console.log("LOCATION STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Builds the default location state directory",
  () => {
    assert.strictEqual(
      getLocationStateDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "locations"
      )
    );
  }
);

test(
  "Builds a location state file path",
  () => {
    assert.strictEqual(
      getLocationStateFilePath({
        locationId: "back_alley_1"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "locations",
        "back_alley_1.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getLocationStateFilePath({
        worldId: "world-2",
        locationId: "safehouse_1"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "locations",
        "safehouse_1.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getLocationStateFilePath({
        savesDirectory: "runtime-saves",
        locationId: "safehouse_1"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "locations",
        "safehouse_1.json"
      )
    );
  }
);

test(
  "Trims a location identifier",
  () => {
    assert.strictEqual(
      getLocationStateFilePath({
        locationId: "  safehouse_1  "
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "locations",
        "safehouse_1.json"
      )
    );
  }
);

test(
  "Rejects a missing location identifier",
  () => {
    assert.throws(
      () => getLocationStateFilePath(),
      /locationId must be a non-empty string/
    );
  }
);

test(
  "Rejects an empty location identifier",
  () => {
    assert.throws(
      () => getLocationStateFilePath({
        locationId: ""
      }),
      /locationId must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe location identifier",
  () => {
    assert.throws(
      () => getLocationStateFilePath({
        locationId: "../back_alley_1"
      }),
      /locationId may contain only/
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