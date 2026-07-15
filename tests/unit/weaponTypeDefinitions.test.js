"use strict";

const assert = require("assert");

const {
  WEAPON_TYPE_CATEGORY,
  WEAPON_TYPE_DEFINITIONS,
  getWeaponTypeDefinitions,
  getWeaponTypeDefinition,
  validateWeaponTypeDefinitions
} = require("../../src/game/characterCreation/weaponTypeDefinitions");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Defines the initial eight weapon types", () => {
  assert.deepStrictEqual(
    WEAPON_TYPE_DEFINITIONS.map(
      (weaponType) => weaponType.id
    ),
    [
      "pistols",
      "submachine_guns",
      "shotguns",
      "assault_rifles",
      "sniper_rifles",
      "heavy_weapons",
      "blades",
      "blunt_weapons"
    ]
  );
});

test("Defines ranged and melee weapon categories", () => {
  assert.deepStrictEqual(
    WEAPON_TYPE_CATEGORY,
    {
      RANGED: "ranged",
      MELEE: "melee"
    }
  );
});

test("Returns a weapon type by id", () => {
  assert.deepStrictEqual(
    getWeaponTypeDefinition("sniper_rifles"),
    {
      id: "sniper_rifles",
      name: "Sniper Rifles",
      category: WEAPON_TYPE_CATEGORY.RANGED
    }
  );
});

test("Returns null for an unknown weapon type", () => {
  assert.strictEqual(
    getWeaponTypeDefinition("laser_swords"),
    null
  );
});

test("Keeps weapon type definitions immutable", () => {
  const definitions = getWeaponTypeDefinitions();
  const pistols = getWeaponTypeDefinition("pistols");

  assert.strictEqual(
    Object.isFrozen(definitions),
    true
  );

  assert.strictEqual(
    Object.isFrozen(pistols),
    true
  );
});

test("Rejects duplicate weapon type ids", () => {
  assert.throws(
    () =>
      validateWeaponTypeDefinitions([
        {
          id: "test_weapon",
          name: "Test Weapon",
          category: WEAPON_TYPE_CATEGORY.RANGED
        },
        {
          id: "test_weapon",
          name: "Duplicate Weapon",
          category: WEAPON_TYPE_CATEGORY.MELEE
        }
      ]),
    /Duplicate weapon type id/
  );
});

test("Rejects unknown weapon categories", () => {
  assert.throws(
    () =>
      validateWeaponTypeDefinitions([
        {
          id: "test_weapon",
          name: "Test Weapon",
          category: "unknown"
        }
      ]),
    /unknown category/
  );
});

async function run() {
  console.log("================================");
  console.log("WEAPON TYPE DEFINITION TESTS");
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