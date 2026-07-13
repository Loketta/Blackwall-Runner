"use strict";

const assert = require("assert");

const {
  NarrationSnapshot
} = require(
  "../../src/game/presentation/narrationSnapshot"
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

function createSnapshot(overrides = {}) {
  return new NarrationSnapshot({
    fingerprint: "scene-fingerprint-1",
    mode: "describe_scene",
    narration: "Rain glistens across the alley.",
    source: "openai",
    model: "test-model",
    createdAt: "2045-01-02T03:05:00.000Z",
    ...overrides
  });
}

console.log("================================");
console.log("NARRATION SNAPSHOT TESTS");
console.log("================================");
console.log("");

test("Stores the narration snapshot contract", () => {
  const snapshot = createSnapshot();

  assert.strictEqual(
    snapshot.fingerprint,
    "scene-fingerprint-1"
  );
  assert.strictEqual(
    snapshot.mode,
    "describe_scene"
  );
  assert.strictEqual(
    snapshot.narration,
    "Rain glistens across the alley."
  );
  assert.strictEqual(
    snapshot.source,
    "openai"
  );
  assert.strictEqual(
    snapshot.model,
    "test-model"
  );
  assert.strictEqual(
    snapshot.createdAt,
    "2045-01-02T03:05:00.000Z"
  );
});

test("Normalises string values", () => {
  const snapshot = createSnapshot({
    fingerprint: "  scene-fingerprint-1  ",
    mode: "  describe_scene  ",
    narration: "  Rain glistens across the alley.  ",
    source: "  openai  ",
    model: "  test-model  "
  });

  assert.strictEqual(
    snapshot.fingerprint,
    "scene-fingerprint-1"
  );
  assert.strictEqual(
    snapshot.mode,
    "describe_scene"
  );
  assert.strictEqual(
    snapshot.narration,
    "Rain glistens across the alley."
  );
  assert.strictEqual(
    snapshot.source,
    "openai"
  );
  assert.strictEqual(
    snapshot.model,
    "test-model"
  );
});

test("Normalises a date string to ISO format", () => {
  const snapshot = createSnapshot({
    createdAt: "2045-01-02T03:05:00Z"
  });

  assert.strictEqual(
    snapshot.createdAt,
    "2045-01-02T03:05:00.000Z"
  );
});

test("Normalises a Date instance to ISO format", () => {
  const snapshot = createSnapshot({
    createdAt: new Date("2045-01-02T03:05:00.000Z")
  });

  assert.strictEqual(
    snapshot.createdAt,
    "2045-01-02T03:05:00.000Z"
  );
});

test("Returns an immutable snapshot", () => {
  const snapshot = createSnapshot();

  assert.strictEqual(
    Object.isFrozen(snapshot),
    true
  );

  assert.throws(
    () => {
      snapshot.narration = "Changed.";
    },
    TypeError
  );
});

test("Rejects an invalid fingerprint", () => {
  assert.throws(
    () => createSnapshot({ fingerprint: " " }),
    /fingerprint must be a non-empty string/
  );
});

test("Rejects an invalid mode", () => {
  assert.throws(
    () => createSnapshot({ mode: null }),
    /mode must be a non-empty string/
  );
});

test("Rejects an invalid narration", () => {
  assert.throws(
    () => createSnapshot({ narration: "" }),
    /narration must be a non-empty string/
  );
});

test("Rejects an invalid source", () => {
  assert.throws(
    () => createSnapshot({ source: [] }),
    /source must be a non-empty string/
  );
});

test("Rejects an invalid model", () => {
  assert.throws(
    () => createSnapshot({ model: undefined }),
    /model must be a non-empty string/
  );
});

test("Rejects an invalid timestamp string", () => {
  assert.throws(
    () => createSnapshot({ createdAt: "not-a-date" }),
    /createdAt must be a valid date or date string/
  );
});

test("Rejects an unsupported timestamp type", () => {
  assert.throws(
    () => createSnapshot({ createdAt: 12345 }),
    /createdAt must be a valid date or date string/
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
