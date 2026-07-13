"use strict";

const assert = require("assert");
const {
  loadRuntimeConfig
} = require("../../src/config/runtimeConfig");

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
console.log("RUNTIME CONFIG TESTS");
console.log("================================");
console.log("");

test(
  "Defaults to mock and developer mode",
  () => {
    const config = loadRuntimeConfig({});

    assert.deepStrictEqual(config, {
      aiProvider: "mock",
      presentationMode: "developer",
      openAIApiKey: null,
      openAIModel: null
    });
  }
);

test("Normalises runtime settings", () => {
  const config = loadRuntimeConfig({
    AI_PROVIDER: "  OPENAI  ",
    PRESENTATION_MODE: "  PLAYER  ",
    OPENAI_API_KEY: "  test-key  ",
    OPENAI_MODEL: "  test-model  "
  });

  assert.deepStrictEqual(config, {
    aiProvider: "openai",
    presentationMode: "player",
    openAIApiKey: "test-key",
    openAIModel: "test-model"
  });
});

test("Rejects unsupported providers", () => {
  assert.throws(
    () => loadRuntimeConfig({
      AI_PROVIDER: "unknown"
    }),
    /Unsupported AI_PROVIDER/
  );
});

test(
  "Rejects unsupported presentation modes",
  () => {
    assert.throws(
      () => loadRuntimeConfig({
        PRESENTATION_MODE: "unknown"
      }),
      /Unsupported PRESENTATION_MODE/
    );
  }
);

test("Requires an API key in OpenAI mode", () => {
  assert.throws(
    () => loadRuntimeConfig({
      AI_PROVIDER: "openai",
      OPENAI_MODEL: "test-model"
    }),
    /OPENAI_API_KEY is required/
  );
});

test("Requires a model in OpenAI mode", () => {
  assert.throws(
    () => loadRuntimeConfig({
      AI_PROVIDER: "openai",
      OPENAI_API_KEY: "test-key"
    }),
    /OPENAI_MODEL is required/
  );
});

test("Returns an immutable configuration", () => {
  const config = loadRuntimeConfig({});

  assert.strictEqual(
    Object.isFrozen(config),
    true
  );
});

test("Rejects invalid environments", () => {
  assert.throws(
    () => loadRuntimeConfig(null),
    /environment must be an object/
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
