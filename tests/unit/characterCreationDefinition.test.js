"use strict";

const assert = require("assert");

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES,
  CHARACTER_CREATION_STAGES,
  getCharacterCreationDefinition
} = require("../../src/game/characterCreation/characterCreationDefinition");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Defines the seven core attributes", () => {
  assert.deepStrictEqual(CORE_ATTRIBUTES, [
    "force",
    "agility",
    "dexterity",
    "intellect",
    "awareness",
    "will",
    "face"
  ]);
});

test("Defines the agreed attribute rules", () => {
  assert.deepStrictEqual(ATTRIBUTE_RULES, {
    minimum: 2,
    maximum: 8,
    totalBudget: 42
  });
});

test("Defines the initial creation stages", () => {
  assert.deepStrictEqual(CHARACTER_CREATION_STAGES, [
    "identity",
    "attributes",
    "skills",
    "profession",
    "review"
  ]);
});

test("Returns an immutable shared definition", () => {
  const definition = getCharacterCreationDefinition();

  assert.strictEqual(Object.isFrozen(definition), true);
  assert.strictEqual(Object.isFrozen(definition.attributes), true);
  assert.strictEqual(Object.isFrozen(definition.attributes.ids), true);
  assert.strictEqual(Object.isFrozen(definition.stages), true);
});

async function run() {
  console.log("================================");
  console.log("CHARACTER CREATION DEFINITION TESTS");
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