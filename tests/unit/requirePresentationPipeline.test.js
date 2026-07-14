"use strict";

const assert = require("assert");
const {
  requirePresentationPipeline
} = require(
  "../../src/commands/services/requirePresentationPipeline"
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

function runTests() {
  console.log("================================");
  console.log("REQUIRE PRESENTATION PIPELINE TESTS");
  console.log("================================");
  console.log("");

  test(
    "Returns the injected presentation pipeline",
    () => {
      const presentationPipeline = {
        async present() {}
      };

      const result =
        requirePresentationPipeline({
          presentationPipeline
        });

      assert.strictEqual(
        result,
        presentationPipeline
      );
    }
  );

  test(
    "Rejects a missing presentation pipeline",
    () => {
      assert.throws(
        () => requirePresentationPipeline(),
        {
          name: "TypeError",
          message:
            "services.presentationPipeline must provide a present function."
        }
      );
    }
  );

  test(
    "Rejects a pipeline without present",
    () => {
      assert.throws(
        () =>
          requirePresentationPipeline({
            presentationPipeline: {}
          }),
        {
          name: "TypeError",
          message:
            "services.presentationPipeline must provide a present function."
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
