"use strict";

const assert = require("assert");

const {
  calculateProfessionBonus
} = require("../../src/game/characterCreation/professionBonusCalculator");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Calculates a skill-specific aptitude", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "medic",
      professionLevel: 1,
      skillId: "medicine"
    }),
    2
  );
});

test("Scales aptitudes by profession level", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "medic",
      professionLevel: 3,
      skillId: "medicine"
    }),
    6
  );
});

test("Returns zero for an unrelated skill", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "medic",
      professionLevel: 1,
      skillId: "firearms"
    }),
    0
  );
});

test("Calculates category-based aptitudes", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "engineer",
      professionLevel: 2,
      skillId: "digital_security"
    }),
    2
  );
});

test("Calculates ranged attack check bonuses", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "ranged_specialist",
      professionLevel: 2,
      skillId: "firearms",
      checkCategories: [
        "ranged_attack"
      ]
    }),
    2
  );
});

test("Applies the Operator selected weapon bonus", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "operator",
      professionLevel: 2,
      skillId: "firearms",
      professionChoices: {
        weapon_type: "sniper_rifles"
      },
      weaponType: "sniper_rifles"
    }),
    2
  );
});

test("Does not apply the Operator bonus to another weapon", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "operator",
      professionLevel: 2,
      skillId: "firearms",
      professionChoices: {
        weapon_type: "sniper_rifles"
      },
      weaponType: "pistols"
    }),
    0
  );
});

test("Combines multiple applicable aptitudes", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: "operator",
      professionLevel: 1,
      skillId: "stealth",
      professionChoices: {
        weapon_type: "blades"
      },
      weaponType: "blades"
    }),
    2
  );
});

test("Returns zero for profession level zero", () => {
  assert.strictEqual(
    calculateProfessionBonus({
      professionId: null,
      professionLevel: 0,
      skillId: "firearms"
    }),
    0
  );
});

test("Rejects unknown professions", () => {
  assert.throws(
    () =>
      calculateProfessionBonus({
        professionId: "unknown",
        professionLevel: 1,
        skillId: "firearms"
      }),
    /Unknown profession/
  );
});

test("Rejects unknown skills", () => {
  assert.throws(
    () =>
      calculateProfessionBonus({
        professionId: "medic",
        professionLevel: 1,
        skillId: "unknown"
      }),
    /Unknown skill/
  );
});

test("Rejects invalid profession levels", () => {
  assert.throws(
    () =>
      calculateProfessionBonus({
        professionId: "medic",
        professionLevel: -1,
        skillId: "medicine"
      }),
    /professionLevel must be a non-negative whole number/
  );
});

async function run() {
  console.log("================================");
  console.log("PROFESSION BONUS CALCULATOR TESTS");
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