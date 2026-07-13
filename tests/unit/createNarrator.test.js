"use strict";

const assert = require("assert");
const {
  MockNarrator
} = require("../../src/game/ai/mockNarrator");
const {
  OpenAINarrator
} = require("../../src/game/ai/openAINarrator");
const {
  createNarrator
} = require("../../src/game/ai/createNarrator");

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
console.log("NARRATOR FACTORY TESTS");
console.log("================================");
console.log("");

test("Creates a mock narrator by default", () => {
  const narrator = createNarrator();

  assert.strictEqual(
    narrator instanceof MockNarrator,
    true
  );
});

test("Normalises the provider name", () => {
  const narrator = createNarrator({
    provider: "  MOCK  "
  });

  assert.strictEqual(
    narrator instanceof MockNarrator,
    true
  );
});

test("Creates an OpenAI narrator", () => {
  const client = {
    responses: {
      async create() {
        return {
          output_text: "Narration."
        };
      }
    }
  };

  const narrator = createNarrator({
    provider: "openai",
    client,
    model: "test-model"
  });

  assert.strictEqual(
    narrator instanceof OpenAINarrator,
    true
  );
});

test("Creates an OpenAI client lazily", () => {
  let receivedOptions = null;

  const narrator = createNarrator({
    provider: "openai",
    apiKey: "test-key",
    model: "test-model",
    clientFactory(options) {
      receivedOptions = options;

      return {
        responses: {
          async create() {
            return {
              output_text: "Narration."
            };
          }
        }
      };
    }
  });

  assert.strictEqual(
    narrator instanceof OpenAINarrator,
    true
  );

  assert.deepStrictEqual(
    receivedOptions,
    {
      apiKey: "test-key"
    }
  );
});

test("Does not create a client in mock mode", () => {
  let clientFactoryWasCalled = false;

  createNarrator({
    provider: "mock",
    clientFactory() {
      clientFactoryWasCalled = true;
    }
  });

  assert.strictEqual(
    clientFactoryWasCalled,
    false
  );
});

test("Rejects unsupported providers", () => {
  assert.throws(
    () => createNarrator({
      provider: "unknown"
    }),
    /Unsupported narrator provider/
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
