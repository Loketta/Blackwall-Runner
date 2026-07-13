"use strict";

const assert = require("assert");
const {
  createOpenAIClient
} = require(
  "../../src/game/ai/createOpenAIClient"
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
console.log("OPENAI CLIENT FACTORY TESTS");
console.log("================================");
console.log("");

test("Creates a client with the API key", () => {
  let receivedOptions = null;

  class TestClient {
    constructor(options) {
      receivedOptions = options;
    }
  }

  const client = createOpenAIClient({
    apiKey: "  test-key  ",
    Client: TestClient
  });

  assert.strictEqual(
    client instanceof TestClient,
    true
  );

  assert.deepStrictEqual(
    receivedOptions,
    {
      apiKey: "test-key"
    }
  );
});

test("Rejects an invalid API key", () => {
  assert.throws(
    () => createOpenAIClient({
      apiKey: ""
    }),
    /apiKey must be a non-empty string/
  );
});

test("Rejects an invalid client constructor", () => {
  assert.throws(
    () => createOpenAIClient({
      apiKey: "test-key",
      Client: {}
    }),
    /Client must be a constructor/
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
