"use strict";

const assert = require("assert");

const {
  NarrationMetrics
} = require(
  "../../src/game/presentation/narrationMetrics"
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
console.log("NARRATION METRICS TESTS");
console.log("================================");
console.log("");

test("Starts with zero metrics", () => {
  const metrics = new NarrationMetrics();

  assert.deepStrictEqual(
    metrics.snapshot(),
    {
      requests: 0,
      generated: 0,
      cached: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      apiRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalApiLatencyMs: 0,
      averageApiLatencyMs: 0
    }
  );
});

test("Records generated narration", () => {
  const metrics = new NarrationMetrics();

  metrics.recordGenerated();

  assert.deepStrictEqual(
    metrics.snapshot(),
    {
      requests: 1,
      generated: 1,
      cached: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      apiRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalApiLatencyMs: 0,
      averageApiLatencyMs: 0
    }
  );
});

test("Records a generated cache miss", () => {
  const metrics = new NarrationMetrics();

  metrics.recordGenerated({
    cacheMiss: true
  });

  assert.deepStrictEqual(
    metrics.snapshot(),
    {
      requests: 1,
      generated: 1,
      cached: 0,
      cacheHits: 0,
      cacheMisses: 1,
      cacheHitRate: 0,
      apiRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalApiLatencyMs: 0,
      averageApiLatencyMs: 0
    }
  );
});

test("Records cached narration", () => {
  const metrics = new NarrationMetrics();

  metrics.recordCached();

  assert.deepStrictEqual(
    metrics.snapshot(),
    {
      requests: 1,
      generated: 0,
      cached: 1,
      cacheHits: 1,
      cacheMisses: 0,
      cacheHitRate: 1,
      apiRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalApiLatencyMs: 0,
      averageApiLatencyMs: 0
    }
  );
});

test("Calculates cache hit rate", () => {
  const metrics = new NarrationMetrics();

  metrics.recordGenerated({
    cacheMiss: true
  });
  metrics.recordCached();
  metrics.recordCached();

  const snapshot = metrics.snapshot();

  assert.strictEqual(
    snapshot.cacheHitRate,
    2 / 3
  );
});

test("Counts non-cacheable generation without a miss", () => {
  const metrics = new NarrationMetrics();

  metrics.recordGenerated();
  metrics.recordGenerated({
    cacheMiss: true
  });

  const snapshot = metrics.snapshot();

  assert.strictEqual(snapshot.requests, 2);
  assert.strictEqual(snapshot.generated, 2);
  assert.strictEqual(snapshot.cacheMisses, 1);
});

test("Returns immutable snapshots", () => {
  const metrics = new NarrationMetrics();
  const snapshot = metrics.snapshot();

  assert.strictEqual(
    Object.isFrozen(snapshot),
    true
  );

  assert.throws(
    () => {
      snapshot.requests = 99;
    },
    TypeError
  );
});

test("Does not expose mutable internal state", () => {
  const metrics = new NarrationMetrics();
  const firstSnapshot = metrics.snapshot();

  metrics.recordGenerated();

  assert.strictEqual(
    firstSnapshot.requests,
    0
  );
  assert.strictEqual(
    metrics.snapshot().requests,
    1
  );
});

test("Resets all metrics", () => {
  const metrics = new NarrationMetrics();

  metrics.recordGenerated({
    cacheMiss: true
  });
  metrics.recordCached();
  metrics.reset();

  assert.deepStrictEqual(
    metrics.snapshot(),
    {
      requests: 0,
      generated: 0,
      cached: 0,
      cacheHits: 0,
      cacheMisses: 0,
      cacheHitRate: 0,
      apiRequests: 0,
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
      totalApiLatencyMs: 0,
      averageApiLatencyMs: 0
    }
  );
});

test("Rejects an invalid cache miss flag", () => {
  const metrics = new NarrationMetrics();

  assert.throws(
    () => metrics.recordGenerated({
      cacheMiss: "yes"
    }),
    /cacheMiss must be a boolean/
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
