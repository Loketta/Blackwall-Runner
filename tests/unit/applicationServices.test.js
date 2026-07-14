"use strict";

const assert = require("assert");
const {
  createApplicationServices
} = require(
  "../../src/application/applicationServices"
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
console.log("APPLICATION SERVICES TESTS");
console.log("================================");
console.log("");

test(
  "Creates one shared presentation pipeline",
  () => {
    let factoryCalls = 0;

    const pipeline = {
      async present() {
        return {
          narration: "Narration."
        };
      },

      getMetrics() {
        return {
          requests: 0
        };
      }
    };

    const services =
      createApplicationServices({
        presentationPipelineFactory() {
          factoryCalls += 1;
          return pipeline;
        }
      });

    assert.strictEqual(
      factoryCalls,
      1
    );

    assert.strictEqual(
      services.presentationPipeline,
      pipeline
    );
  }
);

test(
  "Uses an injected presentation pipeline",
  () => {
    let factoryCalls = 0;

    const pipeline = {
      async present() {
        return {
          narration: "Injected narration."
        };
      },

      getMetrics() {
        return {
          requests: 3
        };
      }
    };

    const services =
      createApplicationServices({
        presentationPipeline: pipeline,

        presentationPipelineFactory() {
          factoryCalls += 1;
          return {};
        }
      });

    assert.strictEqual(
      factoryCalls,
      0
    );

    assert.strictEqual(
      services.presentationPipeline,
      pipeline
    );
  }
);

test(
  "Returns an immutable service container",
  () => {
    const services =
      createApplicationServices({
        presentationPipeline: {
          async present() {
            return {
              narration: "Narration."
            };
          },

          getMetrics() {
            return {};
          }
        }
      });

    assert.strictEqual(
      Object.isFrozen(services),
      true
    );

    assert.throws(
      () => {
        services.presentationPipeline = null;
      },
      TypeError
    );
  }
);

test(
  "Rejects an invalid pipeline factory",
  () => {
    assert.throws(
      () => createApplicationServices({
        presentationPipelineFactory: null
      }),
      /presentationPipelineFactory must be a function/
    );
  }
);

test(
  "Rejects an invalid presentation pipeline",
  () => {
    assert.throws(
      () => createApplicationServices({
        presentationPipeline: {
          async present() {}
        }
      }),
      /presentationPipeline must provide present and getMetrics functions/
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
