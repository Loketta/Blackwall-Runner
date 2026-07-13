"use strict";

const assert = require("assert");

const {
  NarrationSnapshot
} = require(
  "../../src/game/presentation/narrationSnapshot"
);
const {
  NarrationCache
} = require(
  "../../src/game/presentation/narrationCache"
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
console.log("NARRATION CACHE TESTS");
console.log("================================");
console.log("");

test("Starts empty", () => {
  const cache = new NarrationCache();

  assert.strictEqual(cache.size(), 0);
});

test("Stores and returns a narration snapshot", () => {
  const cache = new NarrationCache();
  const snapshot = createSnapshot();

  const result = cache.store(snapshot);

  assert.strictEqual(result, snapshot);
  assert.strictEqual(cache.size(), 1);
});

test("Finds a stored snapshot", () => {
  const cache = new NarrationCache();
  const snapshot = createSnapshot();

  cache.store(snapshot);

  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_scene"
    ),
    snapshot
  );
});

test("Normalises lookup values", () => {
  const cache = new NarrationCache();
  const snapshot = createSnapshot();

  cache.store(snapshot);

  assert.strictEqual(
    cache.find(
      "  scene-fingerprint-1  ",
      "  describe_scene  "
    ),
    snapshot
  );
});

test("Returns null for a cache miss", () => {
  const cache = new NarrationCache();

  assert.strictEqual(
    cache.find(
      "missing-fingerprint",
      "describe_scene"
    ),
    null
  );
});

test("Replaces an existing matching snapshot", () => {
  const cache = new NarrationCache();
  const firstSnapshot = createSnapshot();
  const replacementSnapshot = createSnapshot({
    narration: "The alley remains slick with rain.",
    createdAt: "2045-01-02T03:06:00.000Z"
  });

  cache.store(firstSnapshot);
  cache.store(replacementSnapshot);

  assert.strictEqual(cache.size(), 1);
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_scene"
    ),
    replacementSnapshot
  );
});

test("Keeps different modes separate", () => {
  const cache = new NarrationCache();
  const sceneSnapshot = createSnapshot();
  const actionSnapshot = createSnapshot({
    mode: "describe_action",
    narration: "You step into the rain."
  });

  cache.store(sceneSnapshot);
  cache.store(actionSnapshot);

  assert.strictEqual(cache.size(), 2);
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_scene"
    ),
    sceneSnapshot
  );
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_action"
    ),
    actionSnapshot
  );
});

test("Keeps different fingerprints separate", () => {
  const cache = new NarrationCache();
  const firstSnapshot = createSnapshot();
  const secondSnapshot = createSnapshot({
    fingerprint: "scene-fingerprint-2",
    narration: "Neon burns through the mist."
  });

  cache.store(firstSnapshot);
  cache.store(secondSnapshot);

  assert.strictEqual(cache.size(), 2);
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_scene"
    ),
    firstSnapshot
  );
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-2",
      "describe_scene"
    ),
    secondSnapshot
  );
});

test("Clears all stored snapshots", () => {
  const cache = new NarrationCache();

  cache.store(createSnapshot());
  cache.store(createSnapshot({
    fingerprint: "scene-fingerprint-2"
  }));

  cache.clear();

  assert.strictEqual(cache.size(), 0);
  assert.strictEqual(
    cache.find(
      "scene-fingerprint-1",
      "describe_scene"
    ),
    null
  );
});

test("Rejects values that are not narration snapshots", () => {
  const cache = new NarrationCache();

  assert.throws(
    () => cache.store({}),
    /snapshot must be a NarrationSnapshot/
  );
});

test("Rejects an invalid fingerprint lookup", () => {
  const cache = new NarrationCache();

  assert.throws(
    () => cache.find(" ", "describe_scene"),
    /fingerprint must be a non-empty string/
  );
});

test("Rejects an invalid mode lookup", () => {
  const cache = new NarrationCache();

  assert.throws(
    () => cache.find("scene-fingerprint-1", null),
    /mode must be a non-empty string/
  );
});

test("Returns the immutable stored snapshot", () => {
  const cache = new NarrationCache();
  const snapshot = createSnapshot();

  cache.store(snapshot);

  const result = cache.find(
    "scene-fingerprint-1",
    "describe_scene"
  );

  assert.strictEqual(Object.isFrozen(result), true);

  assert.throws(
    () => {
      result.narration = "Changed.";
    },
    TypeError
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
