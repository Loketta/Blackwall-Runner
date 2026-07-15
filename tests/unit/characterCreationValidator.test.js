"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  validateCharacterDraft
} = require("../../src/game/characterCreation/characterCreationValidator");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createValidDraft() {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.attributes = {
    force: 6,
    agility: 6,
    dexterity: 6,
    intellect: 6,
    awareness: 6,
    will: 6,
    face: 6
  };

  return draft;
}

test("Rejects a missing draft", () => {
  assert.deepStrictEqual(validateCharacterDraft(null), {
    valid: false,
    errors: [
      {
        field: "draft",
        code: "invalid_draft",
        message: "Character draft must be an object."
      }
    ]
  });
});

test("Reports unspent attribute points", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  assert.deepStrictEqual(validateCharacterDraft(draft), {
    valid: false,
    errors: [
      {
        field: "attributes",
        code: "unspent_attribute_points",
        message: "You have 28 attribute points remaining."
      }
    ]
  });
});

test("Reports an exceeded attribute budget", () => {
  const draft = createValidDraft();

  draft.attributes.force = 7;

  assert.deepStrictEqual(validateCharacterDraft(draft), {
    valid: false,
    errors: [
      {
        field: "attributes",
        code: "attribute_budget_exceeded",
        message: "You have spent 1 too many attribute points."
      }
    ]
  });
});

test("Reports attributes below the minimum", () => {
  const draft = createValidDraft();

  draft.attributes.force = 1;
  draft.attributes.face = 11;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) => error.code === "attribute_below_minimum"
    ),
    true
  );
});

test("Reports attributes above the maximum", () => {
  const draft = createValidDraft();

  draft.attributes.force = 9;
  draft.attributes.face = 3;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) => error.code === "attribute_above_maximum"
    ),
    true
  );
});

test("Rejects non-integer attribute values", () => {
  const draft = createValidDraft();

  draft.attributes.force = 5.5;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.deepStrictEqual(result.errors[0], {
    field: "attributes.force",
    code: "invalid_attribute_value",
    message: "force must be a whole number."
  });
});

test("Accepts a legal attribute allocation", () => {
  const draft = createValidDraft();

  assert.deepStrictEqual(validateCharacterDraft(draft), {
    valid: true,
    errors: []
  });
});

async function run() {
  console.log("================================");
  console.log("CHARACTER CREATION VALIDATOR TESTS");
  console.log("================================");

  let passed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.callback();
      passed += 1;
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${tests.length - passed} failed`);
  console.log("================================");
}

run();