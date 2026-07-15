"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  CharacterDraftUpdateError,
  updateCharacterName,
  updateCharacterAttribute,
  updateCharacterSkill,
  updateCharacterProfession,
  updateCharacterProfessionChoice
} = require("../../src/game/characterCreation/characterDraftUpdater");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createDraft() {
  return createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });
}

function assertUpdateError(
  callback,
  expectedCode
) {
  assert.throws(
    callback,
    (error) => {
      assert.strictEqual(
        error instanceof CharacterDraftUpdateError,
        true
      );

      assert.strictEqual(
        error.code,
        expectedCode
      );

      return true;
    }
  );
}

test("Updates a character name and revision", () => {
  const original = createDraft();

  const updated = updateCharacterName({
    draft: original,
    expectedRevision: 0,
    name: "  Naoko  "
  });

  assert.strictEqual(updated.identity.name, "Naoko");
  assert.strictEqual(updated.revision, 1);
  assert.strictEqual(original.identity.name, null);
  assert.strictEqual(original.revision, 0);
});

test("Rejects stale draft updates", () => {
  const draft = createDraft();

  assertUpdateError(
    () =>
      updateCharacterName({
        draft,
        expectedRevision: 4,
        name: "Naoko"
      }),
    "stale_draft_revision"
  );
});

test("Updates an attribute without mutating the original", () => {
  const original = createDraft();

  const updated = updateCharacterAttribute({
    draft: original,
    expectedRevision: 0,
    attributeId: "force",
    value: 8
  });

  assert.strictEqual(updated.attributes.force, 8);
  assert.strictEqual(updated.revision, 1);
  assert.strictEqual(original.attributes.force, 2);
});

test("Rejects attributes above the maximum", () => {
  assertUpdateError(
    () =>
      updateCharacterAttribute({
        draft: createDraft(),
        expectedRevision: 0,
        attributeId: "force",
        value: 9
      }),
    "attribute_above_maximum"
  );
});

test("Rejects changes exceeding the attribute budget", () => {
  const draft = createDraft();

  for (const attributeId of Object.keys(
    draft.attributes
  )) {
    draft.attributes[attributeId] = 6;
  }

  assertUpdateError(
    () =>
      updateCharacterAttribute({
        draft,
        expectedRevision: 0,
        attributeId: "force",
        value: 7
      }),
    "attribute_budget_exceeded"
  );
});

test("Updates a skill without mutating the original", () => {
  const original = createDraft();

  const updated = updateCharacterSkill({
    draft: original,
    expectedRevision: 0,
    skillId: "firearms",
    value: 4
  });

  assert.strictEqual(updated.skills.firearms, 4);
  assert.strictEqual(updated.revision, 1);
  assert.strictEqual(original.skills.firearms, 0);
});

test("Rejects skills above the creation maximum", () => {
  assertUpdateError(
    () =>
      updateCharacterSkill({
        draft: createDraft(),
        expectedRevision: 0,
        skillId: "firearms",
        value: 5
      }),
    "skill_above_creation_maximum"
  );
});

test("Rejects changes exceeding the skill budget", () => {
  const draft = createDraft();

  draft.skills.firearms = 4;
  draft.skills.melee = 4;
  draft.skills.evasion = 4;
  draft.skills.stealth = 4;
  draft.skills.investigation = 4;
  draft.skills.perception = 4;

  assertUpdateError(
    () =>
      updateCharacterSkill({
        draft,
        expectedRevision: 0,
        skillId: "athletics",
        value: 1
      }),
    "skill_budget_exceeded"
  );
});

test("Updates a profession and clears old choices", () => {
  const draft = createDraft();

  draft.profession = "operator";
  draft.professionChoices.weapon_type =
    "pistols";

  const updated = updateCharacterProfession({
    draft,
    expectedRevision: 0,
    professionId: "medic"
  });

  assert.strictEqual(updated.profession, "medic");
  assert.deepStrictEqual(
    updated.professionChoices,
    {}
  );
  assert.strictEqual(updated.revision, 1);

  assert.strictEqual(draft.profession, "operator");
  assert.deepStrictEqual(
    draft.professionChoices,
    {
      weapon_type: "pistols"
    }
  );
});

test("Rejects unknown professions", () => {
  assertUpdateError(
    () =>
      updateCharacterProfession({
        draft: createDraft(),
        expectedRevision: 0,
        professionId: "unknown"
      }),
    "unknown_profession"
  );
});

test("Updates an Operator weapon choice", () => {
  const draft = createDraft();

  draft.profession = "operator";

  const updated =
    updateCharacterProfessionChoice({
      draft,
      expectedRevision: 0,
      choiceId: "weapon_type",
      value: " sniper_rifles "
    });

  assert.strictEqual(
    updated.professionChoices.weapon_type,
    "sniper_rifles"
  );

  assert.strictEqual(updated.revision, 1);

  assert.deepStrictEqual(
    draft.professionChoices,
    {}
  );
});

test("Rejects unknown weapon choices", () => {
  const draft = createDraft();

  draft.profession = "operator";

  assertUpdateError(
    () =>
      updateCharacterProfessionChoice({
        draft,
        expectedRevision: 0,
        choiceId: "weapon_type",
        value: "laser_swords"
      }),
    "unknown_weapon_type"
  );
});

test("Rejects choices not used by the profession", () => {
  const draft = createDraft();

  draft.profession = "medic";

  assertUpdateError(
    () =>
      updateCharacterProfessionChoice({
        draft,
        expectedRevision: 0,
        choiceId: "weapon_type",
        value: "pistols"
      }),
    "unexpected_profession_choice"
  );
});

test("Rejects editing a finalised draft", () => {
  const draft = createDraft();

  draft.status = "finalised";

  assertUpdateError(
    () =>
      updateCharacterName({
        draft,
        expectedRevision: 0,
        name: "Naoko"
      }),
    "draft_not_editable"
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER DRAFT UPDATER TESTS");
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