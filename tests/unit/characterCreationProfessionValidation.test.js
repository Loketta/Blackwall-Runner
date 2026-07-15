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

function createMechanicallyValidDraft() {
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

  draft.skills.firearms = 4;
  draft.skills.melee = 4;
  draft.skills.evasion = 4;
  draft.skills.stealth = 4;
  draft.skills.investigation = 4;
  draft.skills.perception = 4;

  return draft;
}

test("A complete draft requires a profession", () => {
  const result = validateCharacterDraft(
    createMechanicallyValidDraft()
  );

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) => error.code === "profession_required"
    ),
    true
  );
});

test("Accepts a complete Medic draft", () => {
  const draft = createMechanicallyValidDraft();

  draft.profession = "medic";

  assert.deepStrictEqual(
    validateCharacterDraft(draft),
    {
      valid: true,
      errors: []
    }
  );
});

test("Requires the Operator weapon choice", () => {
  const draft = createMechanicallyValidDraft();

  draft.profession = "operator";

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.code === "required_profession_choice"
    ),
    true
  );
});

test("Accepts a complete Operator draft", () => {
  const draft = createMechanicallyValidDraft();

  draft.profession = "operator";
  draft.professionChoices.weapon_type = "pistols";

  assert.deepStrictEqual(
    validateCharacterDraft(draft),
    {
      valid: true,
      errors: []
    }
  );
});

test("Rejects choices belonging to another profession", () => {
  const draft = createMechanicallyValidDraft();

  draft.profession = "medic";
  draft.professionChoices.weapon_type = "pistols";

  const result = validateCharacterDraft(draft);

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors.some(
      (error) =>
        error.code === "unexpected_profession_choice"
    ),
    true
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER PROFESSION VALIDATION TESTS");
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