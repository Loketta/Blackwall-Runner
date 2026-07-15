"use strict";

const assert = require("assert");

const {
  CHECK_ROLL_MODE
} = require("../../src/game/checks/checkRollProfile");

const {
  defaultRollDie,
  validateCheckProfile,
  resolveCheckRoll
} = require("../../src/game/checks/checkResolver");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createStandardProfile() {
  return {
    skillId: "firearms",
    attributeId: "dexterity",
    trained: true,
    rollMode: CHECK_ROLL_MODE.STANDARD,
    dice: {
      count: 1,
      sides: 10,
      keep: "only"
    },
    staticModifier: 10
  };
}

function createDisadvantageProfile() {
  return {
    skillId: "medicine",
    attributeId: "dexterity",
    trained: false,
    rollMode: CHECK_ROLL_MODE.DISADVANTAGE,
    dice: {
      count: 2,
      sides: 10,
      keep: "lower"
    },
    staticModifier: 6
  };
}

function createSequenceRoller(results) {
  const remaining = [...results];

  return () => {
    if (remaining.length === 0) {
      throw new Error("No test die results remain.");
    }

    return remaining.shift();
  };
}

test("Resolves a standard trained check", () => {
  assert.deepStrictEqual(
    resolveCheckRoll({
      profile: createStandardProfile(),
      rollDie: createSequenceRoller([7])
    }),
    {
      skillId: "firearms",
      attributeId: "dexterity",
      trained: true,
      rollMode: CHECK_ROLL_MODE.STANDARD,
      diceRolled: [7],
      keptDie: 7,
      discardedDice: [],
      staticModifier: 10,
      total: 17
    }
  );
});

test("Keeps the lower result for disadvantage", () => {
  assert.deepStrictEqual(
    resolveCheckRoll({
      profile: createDisadvantageProfile(),
      rollDie: createSequenceRoller([8, 3])
    }),
    {
      skillId: "medicine",
      attributeId: "dexterity",
      trained: false,
      rollMode: CHECK_ROLL_MODE.DISADVANTAGE,
      diceRolled: [8, 3],
      keptDie: 3,
      discardedDice: [8],
      staticModifier: 6,
      total: 9
    }
  );
});

test("Handles matching disadvantage dice", () => {
  const result = resolveCheckRoll({
    profile: createDisadvantageProfile(),
    rollDie: createSequenceRoller([4, 4])
  });

  assert.deepStrictEqual(result.diceRolled, [4, 4]);
  assert.strictEqual(result.keptDie, 4);
  assert.deepStrictEqual(result.discardedDice, [4]);
  assert.strictEqual(result.total, 10);
});

test("Supports negative static modifiers", () => {
  const profile = createStandardProfile();

  profile.staticModifier = -2;

  const result = resolveCheckRoll({
    profile,
    rollDie: createSequenceRoller([6])
  });

  assert.strictEqual(result.total, 4);
});

test("Rejects malformed standard profiles", () => {
  const profile = createStandardProfile();

  profile.dice.count = 2;

  assert.throws(
    () => validateCheckProfile(profile),
    /Standard checks must roll one die/
  );
});

test("Rejects malformed disadvantage profiles", () => {
  const profile = createDisadvantageProfile();

  profile.dice.keep = "only";

  assert.throws(
    () => validateCheckProfile(profile),
    /Disadvantage checks must roll two dice/
  );
});

test("Rejects unsupported roll modes", () => {
  const profile = createStandardProfile();

  profile.rollMode = "advantage";

  assert.throws(
    () => validateCheckProfile(profile),
    /Unsupported check roll mode/
  );
});

test("Rejects invalid injected die results", () => {
  assert.throws(
    () =>
      resolveCheckRoll({
        profile: createStandardProfile(),
        rollDie: () => 11
      }),
    /Die result must be between 1 and 10/
  );
});

test("Rejects non-function dice rollers", () => {
  assert.throws(
    () =>
      resolveCheckRoll({
        profile: createStandardProfile(),
        rollDie: 7
      }),
    /rollDie must be a function/
  );
});

test("The default die roller stays within range", () => {
  for (let index = 0; index < 100; index += 1) {
    const result = defaultRollDie(10);

    assert.strictEqual(Number.isInteger(result), true);
    assert.strictEqual(result >= 1, true);
    assert.strictEqual(result <= 10, true);
  }
});

async function run() {
  console.log("================================");
  console.log("CHECK RESOLVER TESTS");
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