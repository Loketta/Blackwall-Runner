"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  calculateEffectiveSkill,
  calculateDraftEffectiveSkill
} = require("../../src/game/characterCreation/effectiveSkillCalculator");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Returns the base rank without bonuses", () => {
  assert.deepStrictEqual(
    calculateEffectiveSkill({
      skillId: "firearms",
      baseRank: 4
    }),
    {
      skillId: "firearms",
      baseRank: 4,
      professionBonus: 0,
      equipmentBonus: 0,
      temporaryModifiers: 0,
      effectiveRank: 4
    }
  );
});

test("Adds profession bonuses without changing base rank", () => {
  const result = calculateEffectiveSkill({
    skillId: "medicine",
    baseRank: 4,
    professionId: "medic",
    professionLevel: 1
  });

  assert.deepStrictEqual(result, {
    skillId: "medicine",
    baseRank: 4,
    professionBonus: 2,
    equipmentBonus: 0,
    temporaryModifiers: 0,
    effectiveRank: 6
  });
});

test("Adds equipment and temporary modifiers", () => {
  const result = calculateEffectiveSkill({
    skillId: "medicine",
    baseRank: 4,
    professionId: "medic",
    professionLevel: 1,
    equipmentBonus: 1,
    temporaryModifiers: -2
  });

  assert.strictEqual(result.effectiveRank, 5);
});

test("Calculates an effective skill from a draft", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.skills.firearms = 4;
  draft.profession = "operator";
  draft.professionChoices.weapon_type =
    "sniper_rifles";

  const result = calculateDraftEffectiveSkill({
    draft,
    skillId: "firearms",
    professionLevel: 1,
    weaponType: "sniper_rifles"
  });

  assert.deepStrictEqual(result, {
    skillId: "firearms",
    baseRank: 4,
    professionBonus: 1,
    equipmentBonus: 0,
    temporaryModifiers: 0,
    effectiveRank: 5
  });

  assert.strictEqual(draft.skills.firearms, 4);
});

test("Supports effective ranks above the creation maximum", () => {
  const result = calculateEffectiveSkill({
    skillId: "endurance",
    baseRank: 4,
    professionId: "melee_specialist",
    professionLevel: 2
  });

  assert.strictEqual(result.professionBonus, 4);
  assert.strictEqual(result.effectiveRank, 8);
});

test("Rejects invalid base ranks", () => {
  assert.throws(
    () =>
      calculateEffectiveSkill({
        skillId: "firearms",
        baseRank: -1
      }),
    /baseRank must be a non-negative whole number/
  );
});

test("Rejects drafts without skill storage", () => {
  assert.throws(
    () =>
      calculateDraftEffectiveSkill({
        draft: {},
        skillId: "firearms"
      }),
    /draft must contain skill ranks/
  );
});

async function run() {
  console.log("================================");
  console.log("EFFECTIVE SKILL CALCULATOR TESTS");
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