"use strict";

const assert = require("assert");
const path = require("path");

const {
  getCharacterDraftStateDirectory,
  getCharacterDraftStateFilePath
} = require("../../src/game/world/characterDraftStatePaths");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Builds the world-scoped character draft directory", () => {
  const savesDirectory = path.resolve(
    "temporary-saves"
  );

  assert.strictEqual(
    getCharacterDraftStateDirectory({
      savesDirectory,
      worldId: "test-world"
    }),
    path.join(
      savesDirectory,
      "worlds",
      "test-world",
      "state",
      "characterDrafts"
    )
  );
});

test("Builds a character draft state file path", () => {
  const savesDirectory = path.resolve(
    "temporary-saves"
  );

  assert.strictEqual(
    getCharacterDraftStateFilePath({
      savesDirectory,
      worldId: "test-world",
      draftId: "draft-1"
    }),
    path.join(
      savesDirectory,
      "worlds",
      "test-world",
      "state",
      "characterDrafts",
      "draft-1.json"
    )
  );
});

test("Rejects unsafe draft ids", () => {
  assert.throws(
    () =>
      getCharacterDraftStateFilePath({
        worldId: "test-world",
        draftId: "../draft"
      }),
    /draftId may contain only/
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER DRAFT STATE PATH TESTS");
  console.log("================================");

  let passed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.callback();
      passed += 1;
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${tests.length - passed} failed`);
  console.log("================================");
}

run();