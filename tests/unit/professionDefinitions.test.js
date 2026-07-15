"use strict";

const assert = require("assert");

const {
  PROFESSION_DEFINITION_STATUS,
  APTITUDE_TARGET_TYPE,
  PROFESSION_CHOICE_TYPE,
  PROFESSION_DEFINITIONS,
  getProfessionDefinitions,
  getProfessionDefinition,
  validateProfessionDefinitions
} = require("../../src/game/characterCreation/professionDefinitions");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createTestProfession(overrides = {}) {
  return {
    id: "test_profession",
    name: "Test Profession",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "athletics",
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "test_mastery",
      name: "Test Mastery",
      implementationTier: "easy",
      description: "Test description."
    },
    ...overrides
  };
}

test("Defines the ten professions", () => {
  assert.deepStrictEqual(
    PROFESSION_DEFINITIONS.map(
      (profession) => profession.id
    ),
    [
      "melee_specialist",
      "ranged_specialist",
      "operator",
      "engineer",
      "medic",
      "face",
      "driver",
      "investigator",
      "hacker",
      "commander"
    ]
  );
});

test("Uses unique profession and mastery ids", () => {
  const professionIds = PROFESSION_DEFINITIONS.map(
    (profession) => profession.id
  );

  const masteryIds = PROFESSION_DEFINITIONS.map(
    (profession) => profession.mastery.id
  );

  assert.strictEqual(
    new Set(professionIds).size,
    professionIds.length
  );

  assert.strictEqual(
    new Set(masteryIds).size,
    masteryIds.length
  );
});

test("Returns a profession by id", () => {
  assert.strictEqual(
    getProfessionDefinition("medic").name,
    "Medic"
  );
});

test("Returns null for an unknown profession", () => {
  assert.strictEqual(
    getProfessionDefinition("unknown"),
    null
  );
});

test("Defines the Melee Specialist Endurance bonus", () => {
  const profession = getProfessionDefinition(
    "melee_specialist"
  );

  const enduranceAptitude = profession.aptitudes.find(
    (aptitude) => aptitude.targetId === "endurance"
  );

  assert.deepStrictEqual(enduranceAptitude, {
    targetType: APTITUDE_TARGET_TYPE.SKILL,
    targetId: "endurance",
    bonusPerLevel: 2
  });
});

test("Defines the Operator weapon-type choice", () => {
  const operator = getProfessionDefinition("operator");

  assert.deepStrictEqual(operator.choices, [
    {
      id: "weapon_type",
      type: PROFESSION_CHOICE_TYPE.WEAPON_TYPE,
      required: true,
      minimumSelections: 1,
      maximumSelections: 1
    }
  ]);
});

test("Uses categories for broad profession aptitudes", () => {
  const engineer = getProfessionDefinition("engineer");
  const rangedSpecialist = getProfessionDefinition(
    "ranged_specialist"
  );

  assert.strictEqual(
    engineer.aptitudes[0].targetType,
    APTITUDE_TARGET_TYPE.CATEGORY
  );

  assert.strictEqual(
    rangedSpecialist.aptitudes[0].targetType,
    APTITUDE_TARGET_TYPE.CHECK_CATEGORY
  );
});

test("Marks unresolved profession definitions provisional", () => {
  assert.strictEqual(
    getProfessionDefinition("face").status,
    PROFESSION_DEFINITION_STATUS.PROVISIONAL
  );

  assert.strictEqual(
    getProfessionDefinition("driver").status,
    PROFESSION_DEFINITION_STATUS.PROVISIONAL
  );
});

test("Keeps profession definitions immutable", () => {
  const professions = getProfessionDefinitions();
  const operator = getProfessionDefinition("operator");

  assert.strictEqual(Object.isFrozen(professions), true);
  assert.strictEqual(Object.isFrozen(operator), true);
  assert.strictEqual(
    Object.isFrozen(operator.aptitudes),
    true
  );
  assert.strictEqual(
    Object.isFrozen(operator.choices),
    true
  );
  assert.strictEqual(
    Object.isFrozen(operator.mastery),
    true
  );
});

test("Rejects duplicate profession ids", () => {
  const first = createTestProfession();
  const second = createTestProfession({
    mastery: {
      id: "second_mastery",
      name: "Second Mastery",
      implementationTier: "easy",
      description: "Second description."
    }
  });

  assert.throws(
    () =>
      validateProfessionDefinitions([
        first,
        second
      ]),
    /Duplicate profession id/
  );
});

test("Rejects duplicate mastery ids", () => {
  const first = createTestProfession();

  const second = createTestProfession({
    id: "second_profession"
  });

  assert.throws(
    () =>
      validateProfessionDefinitions([
        first,
        second
      ]),
    /Duplicate mastery id/
  );
});

test("Rejects unknown skill references", () => {
  const profession = createTestProfession({
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "unknown_skill",
        bonusPerLevel: 1
      }
    ]
  });

  assert.throws(
    () =>
      validateProfessionDefinitions([
        profession
      ]),
    /references unknown skill/
  );
});

test("Rejects invalid aptitude bonuses", () => {
  const profession = createTestProfession({
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "athletics",
        bonusPerLevel: 0
      }
    ]
  });

  assert.throws(
    () =>
      validateProfessionDefinitions([
        profession
      ]),
    /invalid aptitude bonus/
  );
});

test("Rejects unknown choice types", () => {
  const profession = createTestProfession({
    choices: [
      {
        id: "test_choice",
        type: "unknown_choice",
        required: true,
        minimumSelections: 1,
        maximumSelections: 1
      }
    ]
  });

  assert.throws(
    () =>
      validateProfessionDefinitions([
        profession
      ]),
    /unknown choice type/
  );
});

async function run() {
  console.log("================================");
  console.log("PROFESSION DEFINITION TESTS");
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