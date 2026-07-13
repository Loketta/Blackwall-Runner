"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");
const {
  PromptBuilder
} = require("../../src/game/ai/promptBuilder");

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

function createRequest(overrides = {}) {
  return new NarrationRequest({
    playerInput: "I check the alley.",
    mode: "describe_location",
    narrativeContext: {
      world: {
        name: "Blackwall Runner",
        time: "2045-01-02T03:05:00",
        weather: "light rain"
      },
      player: {
        id: "player_1",
        name: "Runner"
      },
      location: {
        id: "back_alley_1",
        name: "Back Alley"
      },
      visibleCharacters: [],
      visibleItems: [],
      visibleObjects: [],
      visibleShops: [],
      recentEvents: []
    },
    instructions: {
      preservePlayerAgency: true,
      useOnlyProvidedFacts: true
    },
    ...overrides
  });
}

console.log("================================");
console.log("PROMPT BUILDER TESTS");
console.log("================================");
console.log("");

test("Builds system and user prompts", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.strictEqual(
    typeof prompt.systemPrompt,
    "string"
  );
  assert.strictEqual(
    typeof prompt.userPrompt,
    "string"
  );
});

test("Includes permanent simulation rules", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.match(
    prompt.systemPrompt,
    /engine context as authoritative truth/
  );
  assert.match(
    prompt.systemPrompt,
    /Do not invent mechanics/
  );
  assert.match(
    prompt.systemPrompt,
    /Do not decide actions, thoughts or dialogue/
  );
});

test("Includes narration mode and player input", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.match(
    prompt.userPrompt,
    /describe_location/
  );
  assert.match(
    prompt.userPrompt,
    /I check the alley\./
  );
});

test("Serialises narrative context", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.match(
    prompt.userPrompt,
    /"name": "Back Alley"/
  );
  assert.match(
    prompt.userPrompt,
    /"weather": "light rain"/
  );
});

test("Serialises additional instructions", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.match(
    prompt.userPrompt,
    /"preservePlayerAgency": true/
  );
  assert.match(
    prompt.userPrompt,
    /"useOnlyProvidedFacts": true/
  );
});

test("Returns prompt metadata", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.deepStrictEqual(prompt.metadata, {
    mode: "describe_location",
    outputFormat: "plain_text"
  });
});

test("Returns an immutable prompt", () => {
  const prompt = new PromptBuilder().build(
    createRequest()
  );

  assert.strictEqual(
    Object.isFrozen(prompt),
    true
  );
  assert.strictEqual(
    Object.isFrozen(prompt.metadata),
    true
  );

  assert.throws(
    () => {
      prompt.metadata.mode = "changed";
    },
    TypeError
  );
});

test("Builds deterministic prompt output", () => {
  const builder = new PromptBuilder();
  const request = createRequest();

  const first = builder.build(request);
  const second = builder.build(request);

  assert.deepStrictEqual(first, second);
});

test("Rejects values that are not narration requests", () => {
  const builder = new PromptBuilder();

  assert.throws(
    () => builder.build({}),
    /requires a NarrationRequest/
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
