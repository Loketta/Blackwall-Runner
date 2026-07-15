"use strict";

const assert = require("assert");

const {
  SKILL_CREATION_RULES
} = require("../../src/game/characterCreation/skillDefinitions");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Defines the agreed skill creation rules", () => {
  assert.deepStrictEqual(SKILL_CREATION_RULES, {
    minimum: 0,
    maximum: 4,
    totalBudget: 24,
    untrainedAllowed: true,
    untrainedRollMode: "disadvantage"
  });
});

test("Keeps the skill creation rules immutable", () => {
  assert.strictEqual(
    Object.isFrozen(SKILL_CREATION_RULES),
    true
  );
});

async function run() {
  console.log("================================");
  console.log("SKILL CREATION RULE TESTS");
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