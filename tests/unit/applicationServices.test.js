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

function createPipeline() {
  return {
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
}

console.log("================================");
console.log("APPLICATION SERVICES TESTS");
console.log("================================");
console.log("");

test(
  "Creates one shared presentation pipeline",
  () => {
    let factoryCalls = 0;
    const pipeline = createPipeline();

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
    const pipeline = createPipeline();

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
  "Exposes an injected world manager",
  () => {
    const activeWorld = {
      worldId: "development-world"
    };

    const worldManager = {
      getActiveWorld() {
        return activeWorld;
      }
    };

    const services =
      createApplicationServices({
        presentationPipeline:
          createPipeline(),
        worldManager
      });

    assert.strictEqual(
      services.worldManager,
      worldManager
    );

    assert.strictEqual(
      services.worldManager.getActiveWorld(),
      activeWorld
    );
  }
);

test(
  "Defaults to no world manager",
  () => {
    const services =
      createApplicationServices({
        presentationPipeline:
          createPipeline()
      });

    assert.strictEqual(
      services.worldManager,
      null
    );
  }
);

test(
  "Returns an immutable service container",
  () => {
    const services =
      createApplicationServices({
        presentationPipeline:
          createPipeline(),
        worldManager: {
          getActiveWorld() {
            return null;
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

    assert.throws(
      () => {
        services.worldManager = null;
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

test(
  "Rejects an invalid world manager",
  () => {
    assert.throws(
      () => createApplicationServices({
        presentationPipeline:
          createPipeline(),
        worldManager: {}
      }),
      /worldManager must provide a getActiveWorld function/
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
