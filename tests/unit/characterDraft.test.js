"use strict";

const assert = require("assert");

const {
  SKILL_DEFINITIONS
} = require("../../src/game/characterCreation/skillDefinitions");

const {
  CHARACTER_DRAFT_STATUS,
  createStartingAttributes,
  createStartingSkills,
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Creates attributes at the creation minimum", () => {
  assert.deepStrictEqual(createStartingAttributes(), {
    force: 2,
    agility: 2,
    dexterity: 2,
    intellect: 2,
    awareness: 2,
    will: 2,
    face: 2
  });
});

test("Creates every skill at zero", () => {
  const skills = createStartingSkills();

  assert.strictEqual(
    Object.keys(skills).length,
    SKILL_DEFINITIONS.length
  );

  assert.strictEqual(
    Object.values(skills).every((value) => value === 0),
    true
  );
});

test("Creates an in-progress character draft", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  assert.strictEqual(draft.id, "draft-1");
  assert.strictEqual(draft.ownerId, "discord-user-1");
  assert.strictEqual(draft.platform, "discord");
  assert.strictEqual(draft.worldId, "development-world");
  assert.strictEqual(draft.definitionVersion, 1);
  assert.strictEqual(draft.revision, 0);
  assert.strictEqual(
    draft.status,
    CHARACTER_DRAFT_STATUS.IN_PROGRESS
  );
  assert.strictEqual(draft.currentStage, "identity");

  assert.deepStrictEqual(draft.identity, {
    name: null
  });

  assert.deepStrictEqual(
    draft.attributes,
    createStartingAttributes()
  );

  assert.deepStrictEqual(
    draft.skills,
    createStartingSkills()
  );

  assert.strictEqual(draft.profession, null);
  assert.deepStrictEqual(draft.professionChoices, {});
  assert.deepStrictEqual(draft.completedStages, []);
});

test("Rejects missing ownership information", () => {
  assert.throws(
    () =>
      createCharacterDraft({
        id: "draft-1",
        ownerId: "",
        platform: "discord",
        worldId: "development-world"
      }),
    /ownerId must be a non-empty string/
  );
});

test("Creates independent attribute objects", () => {
  const first = createStartingAttributes();
  const second = createStartingAttributes();

  first.force = 8;

  assert.strictEqual(second.force, 2);
});

test("Creates independent skill objects", () => {
  const first = createStartingSkills();
  const second = createStartingSkills();

  first.firearms = 4;

  assert.strictEqual(second.firearms, 0);
});

async function run() {
  console.log("================================");
  console.log("CHARACTER DRAFT TESTS");
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