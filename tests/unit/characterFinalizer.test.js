"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  CharacterFinalizationError,
  calculateMobility,
  finaliseCharacterDraft
} = require("../../src/game/characterCreation/characterFinalizer");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createCompleteDraft() {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.identity.name = "Naoko";

  draft.attributes = {
    force: 6,
    agility: 5,
    dexterity: 7,
    intellect: 6,
    awareness: 7,
    will: 5,
    face: 6
  };

  draft.skills.firearms = 4;
  draft.skills.stealth = 4;
  draft.skills.evasion = 4;
  draft.skills.investigation = 4;
  draft.skills.perception = 4;
  draft.skills.insight = 4;

  draft.profession = "operator";
  draft.professionChoices.weapon_type =
    "sniper_rifles";

  return draft;
}

function assertFinalizationError(
  callback,
  expectedCode
) {
  assert.throws(
    callback,
    (error) => {
      assert.strictEqual(
        error instanceof CharacterFinalizationError,
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

test("Calculates Mobility from Force and the higher coordination attribute", () => {
  assert.strictEqual(
    calculateMobility({
      force: 6,
      agility: 5,
      dexterity: 7
    }),
    6
  );
});

test("Finalises a complete draft", () => {
  const draft = createCompleteDraft();

  const result = finaliseCharacterDraft({
    draft,
    characterId: "character-naoko",
    startingLocation: "back_alley_1",
    startingCredits: 500,
    startingInventory: [
      "unity_pistol"
    ]
  });

  assert.deepStrictEqual(result.character, {
    id: "character-naoko",
    name: "Naoko",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world",
    profession: {
      id: "operator",
      name: "Operator",
      level: 1,
      choices: {
        weapon_type: "sniper_rifles"
      }
    },
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    derived: {
      mobility: 6
    },
    skills: draft.skills,
    credits: 500,
    location: "back_alley_1",
    inventory: [
      "unity_pistol"
    ],
    characterCreation: {
      draftId: "draft-1",
      definitionVersion: 1
    }
  });

  assert.strictEqual(
    result.finalisedDraft.status,
    "finalised"
  );

  assert.strictEqual(
    result.finalisedDraft.revision,
    1
  );

  assert.strictEqual(
    result.finalisedDraft.finalCharacterId,
    "character-naoko"
  );
});

test("Does not mutate the source draft", () => {
  const draft = createCompleteDraft();

  finaliseCharacterDraft({
    draft,
    characterId: "character-naoko",
    startingLocation: "back_alley_1"
  });

  assert.strictEqual(
    draft.status,
    "in_progress"
  );

  assert.strictEqual(
    draft.revision,
    0
  );

  assert.strictEqual(
    draft.finalCharacterId,
    undefined
  );
});

test("Requires a character name", () => {
  const draft = createCompleteDraft();

  draft.identity.name = null;

  assertFinalizationError(
    () =>
      finaliseCharacterDraft({
        draft,
        characterId: "character-naoko",
        startingLocation: "back_alley_1"
      }),
    "invalid_required_value"
  );
});

test("Rejects mechanically invalid drafts", () => {
  const draft = createCompleteDraft();

  draft.skills.firearms = 3;

  assert.throws(
    () =>
      finaliseCharacterDraft({
        draft,
        characterId: "character-naoko",
        startingLocation: "back_alley_1"
      }),
    (error) => {
      assert.strictEqual(
        error.code,
        "draft_validation_failed"
      );

      assert.strictEqual(
        error.validation.valid,
        false
      );

      assert.strictEqual(
        error.validation.errors.some(
          (entry) =>
            entry.code ===
            "unspent_skill_points"
        ),
        true
      );

      return true;
    }
  );
});

test("Rejects repeat finalisation", () => {
  const draft = createCompleteDraft();

  draft.status = "finalised";

  assertFinalizationError(
    () =>
      finaliseCharacterDraft({
        draft,
        characterId: "character-naoko",
        startingLocation: "back_alley_1"
      }),
    "draft_already_completed"
  );
});

test("Rejects negative starting credits", () => {
  assertFinalizationError(
    () =>
      finaliseCharacterDraft({
        draft: createCompleteDraft(),
        characterId: "character-naoko",
        startingLocation: "back_alley_1",
        startingCredits: -1
      }),
    "invalid_starting_credits"
  );
});

test("Creates independent character collections", () => {
  const draft = createCompleteDraft();

  const result = finaliseCharacterDraft({
    draft,
    characterId: "character-naoko",
    startingLocation: "back_alley_1",
    startingInventory: [
      "unity_pistol"
    ]
  });

  result.character.skills.firearms = 0;
  result.character.inventory.push("protein_bar");

  assert.strictEqual(
    draft.skills.firearms,
    4
  );

  assert.deepStrictEqual(
    draft.inventory,
    undefined
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER FINALIZER TESTS");
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