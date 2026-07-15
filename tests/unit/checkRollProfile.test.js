"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  CHECK_ROLL_MODE,
  buildCheckRollProfile,
  buildDraftCheckRollProfile
} = require("../../src/game/checks/checkRollProfile");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Builds a trained standard roll profile", () => {
  assert.deepStrictEqual(
    buildCheckRollProfile({
      attributeId: "dexterity",
      attributeValue: 6,
      skillId: "firearms",
      baseRank: 4
    }),
    {
      attributeId: "dexterity",
      attributeValue: 6,
      skillId: "firearms",
      skillName: "Firearms",
      trained: true,
      rollMode: CHECK_ROLL_MODE.STANDARD,
      dice: {
        count: 1,
        sides: 10,
        keep: "only"
      },
      baseRank: 4,
      professionBonus: 0,
      equipmentBonus: 0,
      temporaryModifiers: 0,
      effectiveSkill: 4,
      staticModifier: 10
    }
  );
});

test("Builds an untrained disadvantage profile", () => {
  assert.deepStrictEqual(
    buildCheckRollProfile({
      attributeId: "dexterity",
      attributeValue: 6,
      skillId: "medicine",
      baseRank: 0
    }),
    {
      attributeId: "dexterity",
      attributeValue: 6,
      skillId: "medicine",
      skillName: "Medicine",
      trained: false,
      rollMode: CHECK_ROLL_MODE.DISADVANTAGE,
      dice: {
        count: 2,
        sides: 10,
        keep: "lower"
      },
      baseRank: 0,
      professionBonus: 0,
      equipmentBonus: 0,
      temporaryModifiers: 0,
      effectiveSkill: 0,
      staticModifier: 6
    }
  );
});

test("Profession aptitude counts as training", () => {
  const result = buildCheckRollProfile({
    attributeId: "dexterity",
    attributeValue: 6,
    skillId: "medicine",
    baseRank: 0,
    professionId: "medic",
    professionLevel: 1
  });

  assert.strictEqual(result.trained, true);
  assert.strictEqual(
    result.rollMode,
    CHECK_ROLL_MODE.STANDARD
  );
  assert.strictEqual(result.professionBonus, 2);
  assert.strictEqual(result.effectiveSkill, 2);
  assert.strictEqual(result.staticModifier, 8);
});

test("Equipment alone does not count as training", () => {
  const result = buildCheckRollProfile({
    attributeId: "dexterity",
    attributeValue: 6,
    skillId: "medicine",
    baseRank: 0,
    equipmentBonus: 2
  });

  assert.strictEqual(result.trained, false);
  assert.strictEqual(
    result.rollMode,
    CHECK_ROLL_MODE.DISADVANTAGE
  );
  assert.strictEqual(result.effectiveSkill, 2);
  assert.strictEqual(result.staticModifier, 8);
});

test("Temporary modifiers do not count as training", () => {
  const result = buildCheckRollProfile({
    attributeId: "awareness",
    attributeValue: 5,
    skillId: "perception",
    baseRank: 0,
    temporaryModifiers: 3
  });

  assert.strictEqual(result.trained, false);
  assert.strictEqual(result.effectiveSkill, 3);
});

test("Builds a profile from a character draft", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.attributes.dexterity = 7;
  draft.skills.firearms = 4;
  draft.profession = "operator";
  draft.professionChoices.weapon_type =
    "sniper_rifles";

  const result = buildDraftCheckRollProfile({
    draft,
    attributeId: "dexterity",
    skillId: "firearms",
    professionLevel: 1,
    weaponType: "sniper_rifles"
  });

  assert.strictEqual(result.trained, true);
  assert.strictEqual(result.baseRank, 4);
  assert.strictEqual(result.professionBonus, 1);
  assert.strictEqual(result.effectiveSkill, 5);
  assert.strictEqual(result.staticModifier, 12);
});

test("Allows an alternate governing attribute", () => {
  const result = buildCheckRollProfile({
    attributeId: "force",
    attributeValue: 8,
    skillId: "intimidation",
    baseRank: 2
  });

  assert.strictEqual(result.attributeId, "force");
  assert.strictEqual(result.staticModifier, 10);
});

test("Rejects unknown attributes", () => {
  assert.throws(
    () =>
      buildCheckRollProfile({
        attributeId: "charisma",
        attributeValue: 6,
        skillId: "persuasion",
        baseRank: 2
      }),
    /Unknown core attribute/
  );
});

test("Rejects invalid attribute values", () => {
  assert.throws(
    () =>
      buildCheckRollProfile({
        attributeId: "face",
        attributeValue: 5.5,
        skillId: "persuasion",
        baseRank: 2
      }),
    /attributeValue must be a non-negative whole number/
  );
});

test("Rejects drafts without attributes", () => {
  assert.throws(
    () =>
      buildDraftCheckRollProfile({
        draft: {
          skills: {}
        },
        attributeId: "dexterity",
        skillId: "firearms"
      }),
    /draft must contain core attributes/
  );
});

async function run() {
  console.log("================================");
  console.log("CHECK ROLL PROFILE TESTS");
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