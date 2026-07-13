"use strict";

const assert = require("assert");
const {
  PresentationPolicy
} = require(
  "../../src/game/presentation/presentationPolicy"
);

let passed = 0;
let failed = 0;

async function test(name, testFunction) {
  try {
    await testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

async function runTests() {
  console.log("================================");
  console.log("PRESENTATION POLICY TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Renders fallback in developer mode",
    async () => {
      let narrationWasCreated = false;
      let fallbackWasRendered = false;

      const policy = new PresentationPolicy({
        mode: "developer"
      });

      const result = await policy.present({
        async createNarration() {
          narrationWasCreated = true;

          return {
            narration: "Narration."
          };
        },

        renderNarration() {},

        renderFallback() {
          fallbackWasRendered = true;
        }
      });

      assert.strictEqual(
        narrationWasCreated,
        false
      );

      assert.strictEqual(
        fallbackWasRendered,
        true
      );

      assert.deepStrictEqual(result, {
        source: "fallback",
        narrationResult: null
      });
    }
  );

  await test(
    "Renders narration in player mode",
    async () => {
      const narrationResult = {
        narration: "Narration."
      };

      let renderedResult = null;
      let fallbackWasRendered = false;

      const policy = new PresentationPolicy({
        mode: "player"
      });

      const result = await policy.present({
        async createNarration() {
          return narrationResult;
        },

        renderNarration(receivedResult) {
          renderedResult = receivedResult;
        },

        renderFallback() {
          fallbackWasRendered = true;
        }
      });

      assert.strictEqual(
        renderedResult,
        narrationResult
      );

      assert.strictEqual(
        fallbackWasRendered,
        false
      );

      assert.deepStrictEqual(result, {
        source: "narration",
        narrationResult
      });
    }
  );

  await test(
    "Falls back when narration fails",
    async () => {
      let fallbackWasRendered = false;

      const policy = new PresentationPolicy({
        mode: "player"
      });

      const result = await policy.present({
        async createNarration() {
          throw new Error(
            "Narration unavailable."
          );
        },

        renderNarration() {},

        renderFallback() {
          fallbackWasRendered = true;
        }
      });

      assert.strictEqual(
        fallbackWasRendered,
        true
      );

      assert.deepStrictEqual(result, {
        source: "fallback",
        narrationResult: null
      });
    }
  );

  await test(
    "Awaits asynchronous narration",
    async () => {
      const rendered = [];

      const policy = new PresentationPolicy({
        mode: "player"
      });

      await policy.present({
        async createNarration() {
          await Promise.resolve();

          return {
            narration:
              "Asynchronous narration."
          };
        },

        renderNarration(result) {
          rendered.push(result.narration);
        },

        renderFallback() {}
      });

      assert.deepStrictEqual(
        rendered,
        ["Asynchronous narration."]
      );
    }
  );

  await test(
    "Rejects unsupported modes",
    async () => {
      assert.throws(
        () => new PresentationPolicy({
          mode: "unknown"
        }),
        /Unsupported presentation mode/
      );
    }
  );

  await test(
    "Rejects invalid callbacks",
    async () => {
      const policy = new PresentationPolicy({
        mode: "player"
      });

      await assert.rejects(
        () => policy.present({
          createNarration: null,
          renderNarration() {},
          renderFallback() {}
        }),
        /createNarration must be a function/
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

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
