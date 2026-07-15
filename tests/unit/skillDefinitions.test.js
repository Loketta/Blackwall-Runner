"use strict";

const assert = require("assert");

const {
  SKILL_DEFINITION_STATUS,
  SKILL_CATEGORIES,
  SKILL_DEFINITIONS,
  getSkillDefinitions,
  getSkillDefinition,
  validateSkillDefinitions
} = require("../../src/game/characterCreation/skillDefinitions");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Defines the current thirty-three skills", () => {
  assert.strictEqual(SKILL_DEFINITIONS.length, 33);
});

test("Uses unique skill ids", () => {
  const ids = SKILL_DEFINITIONS.map((skill) => skill.id);

  assert.strictEqual(
    new Set(ids).size,
    ids.length
  );
});

test("Returns a skill by id", () => {
  assert.deepStrictEqual(
    getSkillDefinition("digital_security"),
    {
      id: "digital_security",
      name: "Digital Security",
      defaultAttribute: "intellect",
      alternateAttributes: [],
      categories: [
        SKILL_CATEGORIES.TECHNICAL,
        SKILL_CATEGORIES.DIGITAL,
        SKILL_CATEGORIES.SECURITY
      ],
      status: SKILL_DEFINITION_STATUS.CONFIRMED,
      notes: null
    }
  );
});

test("Returns null for an unknown skill", () => {
  assert.strictEqual(
    getSkillDefinition("unknown_skill"),
    null
  );
});

test("Defines Force as an alternate Intimidation attribute", () => {
  const intimidation = getSkillDefinition("intimidation");

  assert.deepStrictEqual(
    intimidation.alternateAttributes,
    ["force"]
  );
});

test("Marks unresolved skills as provisional", () => {
  assert.strictEqual(
    getSkillDefinition("explosives").status,
    SKILL_DEFINITION_STATUS.PROVISIONAL
  );

  assert.strictEqual(
    getSkillDefinition("survival").status,
    SKILL_DEFINITION_STATUS.PROVISIONAL
  );
});

test("Does not yet define vehicle skills", () => {
  const vehicleSkills = SKILL_DEFINITIONS.filter(
    (skill) =>
      skill.categories.includes(
        SKILL_CATEGORIES.VEHICLE_OPERATION
      ) ||
      skill.categories.includes(
        SKILL_CATEGORIES.VEHICLE_REPAIR
      )
  );

  assert.deepStrictEqual(vehicleSkills, []);
});

test("Returns immutable definitions", () => {
  const skills = getSkillDefinitions();
  const firearms = getSkillDefinition("firearms");

  assert.strictEqual(Object.isFrozen(skills), true);
  assert.strictEqual(Object.isFrozen(firearms), true);
  assert.strictEqual(
    Object.isFrozen(firearms.categories),
    true
  );
  assert.strictEqual(
    Object.isFrozen(firearms.alternateAttributes),
    true
  );
});

test("Rejects duplicate skill ids", () => {
  assert.throws(
    () =>
      validateSkillDefinitions([
        {
          id: "test_skill",
          name: "Test Skill",
          defaultAttribute: "force",
          alternateAttributes: [],
          categories: [
            SKILL_CATEGORIES.PHYSICAL
          ],
          status: SKILL_DEFINITION_STATUS.CONFIRMED,
          notes: null
        },
        {
          id: "test_skill",
          name: "Duplicate Skill",
          defaultAttribute: "agility",
          alternateAttributes: [],
          categories: [
            SKILL_CATEGORIES.PHYSICAL
          ],
          status: SKILL_DEFINITION_STATUS.CONFIRMED,
          notes: null
        }
      ]),
    /Duplicate skill id/
  );
});

test("Rejects unknown governing attributes", () => {
  assert.throws(
    () =>
      validateSkillDefinitions([
        {
          id: "test_skill",
          name: "Test Skill",
          defaultAttribute: "unknown",
          alternateAttributes: [],
          categories: [
            SKILL_CATEGORIES.PHYSICAL
          ],
          status: SKILL_DEFINITION_STATUS.CONFIRMED,
          notes: null
        }
      ]),
    /unknown default attribute/
  );
});

test("Rejects unknown categories", () => {
  assert.throws(
    () =>
      validateSkillDefinitions([
        {
          id: "test_skill",
          name: "Test Skill",
          defaultAttribute: "force",
          alternateAttributes: [],
          categories: [
            "unknown_category"
          ],
          status: SKILL_DEFINITION_STATUS.CONFIRMED,
          notes: null
        }
      ]),
    /unknown category/
  );
});

async function run() {
  console.log("================================");
  console.log("SKILL DEFINITION TESTS");
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