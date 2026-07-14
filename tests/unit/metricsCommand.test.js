"use strict";

const assert = require("assert");
const {
  runMetricsCommand
} = require(
  "../../src/commands/handlers/metricsCommand"
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

function createMetrics() {
  return {
    requests: 12,
    generated: 8,
    cached: 4,
    cacheHits: 4,
    cacheMisses: 2,
    cacheHitRate: 2 / 3,
    apiRequests: 5,
    inputTokens: 1234,
    outputTokens: 456,
    totalTokens: 1690,
    totalApiLatencyMs: 4321.4,
    averageApiLatencyMs: 864.28
  };
}

function runTests() {
  console.log("================================");
  console.log("METRICS COMMAND TESTS");
  console.log("================================");
  console.log("");

  test(
    "Reads metrics from the presentation pipeline",
    () => {
      let metricsWereRead = false;

      runMetricsCommand({
        presentationPipeline: {
          getMetrics() {
            metricsWereRead = true;
            return createMetrics();
          }
        },
        log() {}
      });

      assert.strictEqual(
        metricsWereRead,
        true
      );
    }
  );

  test(
    "Prints the complete narration metrics report",
    () => {
      const messages = [];

      runMetricsCommand({
        presentationPipeline: {
          getMetrics() {
            return createMetrics();
          }
        },
        log(message) {
          messages.push(message);
        }
      });

      assert.deepStrictEqual(
        messages,
        [
          "=== NARRATION METRICS ===",
          "",
          "Requests: 12",
          "Generated: 8",
          "Cached: 4",
          "Cache Hits: 4",
          "Cache Misses: 2",
          "Cache Hit Rate: 66.7%",
          "API Requests: 5",
          "Input Tokens: 1234",
          "Output Tokens: 456",
          "Total Tokens: 1690",
          "Total API Latency: 4321 ms",
          "Average API Latency: 864 ms"
        ]
      );
    }
  );

  test(
    "Rejects a missing presentation pipeline",
    () => {
      assert.throws(
        () => runMetricsCommand(),
        {
          name: "TypeError",
          message:
            "services.presentationPipeline must provide a getMetrics function."
        }
      );
    }
  );

  test(
    "Rejects a pipeline without metrics",
    () => {
      assert.throws(
        () =>
          runMetricsCommand({
            presentationPipeline: {}
          }),
        {
          name: "TypeError",
          message:
            "services.presentationPipeline must provide a getMetrics function."
        }
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
}

runTests();
