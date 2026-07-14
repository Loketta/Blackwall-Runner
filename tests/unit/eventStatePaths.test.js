"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_EVENTS_FILE,
  getEventsDirectory,
  getEventStateFilePath
} = require(
  "../../src/game/world/eventStatePaths"
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
console.log("EVENT STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default events file",
  () => {
    assert.strictEqual(
      DEFAULT_EVENTS_FILE,
      "events.json"
    );
  }
);

test(
  "Builds the default events directory",
  () => {
    assert.strictEqual(
      getEventsDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "events"
      )
    );
  }
);

test(
  "Builds the default event state path",
  () => {
    assert.strictEqual(
      getEventStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "events",
        "events.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getEventStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "events",
        "events.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getEventStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "events",
        "events.json"
      )
    );
  }
);

test(
  "Supports a custom events file",
  () => {
    assert.strictEqual(
      getEventStateFilePath({
        eventsFile: "archive.json"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "events",
        "archive.json"
      )
    );
  }
);

test(
  "Rejects an empty events file",
  () => {
    assert.throws(
      () => getEventStateFilePath({
        eventsFile: ""
      }),
      /eventsFile must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe events file",
  () => {
    assert.throws(
      () => getEventStateFilePath({
        eventsFile: "../events.json"
      }),
      /eventsFile contains invalid path characters/
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