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

function createDraft() {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.profession = "medic";

  return draft;
}

function createValidDraft() {
  const draft = createDraft();

  draft.attributes = {
    force: 6,
    agility: 6,
    dexterity: 6,
    intellect: 6,
    awareness: 6,
    will: 6,
    face: 6
  };

  draft.skills.firearms = 4;
  draft.skills.melee = 4;
  draft.skills.evasion = 4;
  draft.skills.stealth = 4;
  draft.skills.investigation = 4;
  draft.skills.perception = 4;

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

test("Reports unspent attribute and skill points", () => {
  const result = validateCharacterDraft(createDraft());

  assert.deepStrictEqual(result, {
    valid: false,
    errors: [
      {
        field: "attributes",
        code: "unspent_attribute_points",
        message: "You have 28 attribute points remaining."
      },
      {
        field: "skills",
        code: "unspent_skill_points",
        message: "You have 24 skill points remaining."
      }
    ]
  });
});

test("Reports an exceeded attribute budget", () => {
  const draft = createValidDraft();

  draft.attributes.force = 7;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.code === "attribute_budget_exceeded"
    ),
    true
  );
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
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.field === "attributes.force" &&
        error.code === "invalid_attribute_value"
    ),
    true
  );
});

test("Reports unspent skill points", () => {
  const draft = createValidDraft();

  draft.skills.firearms = 3;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.code === "unspent_skill_points" &&
        error.message === "You have 1 skill points remaining."
    ),
    true
  );
});

test("Reports an exceeded skill budget", () => {
  const draft = createValidDraft();

  draft.skills.athletics = 1;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.code === "skill_budget_exceeded" &&
        error.message ===
          "You have spent 1 too many skill points."
    ),
    true
  );
});

test("Reports skills above the creation maximum", () => {
  const draft = createValidDraft();

  draft.skills.firearms = 5;
  draft.skills.melee = 3;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.field === "skills.firearms" &&
        error.code === "skill_above_creation_maximum"
    ),
    true
  );
});

test("Reports skills below zero", () => {
  const draft = createValidDraft();

  draft.skills.firearms = -1;
  draft.skills.melee = 5;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.field === "skills.firearms" &&
        error.code === "skill_below_minimum"
    ),
    true
  );
});

test("Rejects non-integer skill values", () => {
  const draft = createValidDraft();

  draft.skills.firearms = 3.5;

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.field === "skills.firearms" &&
        error.code === "invalid_skill_value"
    ),
    true
  );
});

test("Accepts a legal attribute and skill allocation", () => {
  assert.deepStrictEqual(
    validateCharacterDraft(createValidDraft()),
    {
      valid: true,
      errors: []
    }
  );
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