"use strict";

const assert = require("assert");

const {
  CHARACTER_CREATION_STAGE,
  CHARACTER_CREATION_STAGE_ORDER,
  isCharacterCreationStage
} = require(
  "../../src/game/characterCreation/characterCreationStages"
);

const {
  createCharacterCreationStageMachine
} = require(
  "../../src/game/characterCreation/characterCreationStageMachine"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Defines the complete ordered workflow", () => {
  assert.deepStrictEqual(
    CHARACTER_CREATION_STAGE_ORDER,
    [
      "name",
      "attributes",
      "skills",
      "profession",
      "profession_choices",
      "review",
      "finished"
    ]
  );

  assert.strictEqual(
    Object.isFrozen(
      CHARACTER_CREATION_STAGE_ORDER
    ),
    true
  );

  assert.strictEqual(
    isCharacterCreationStage("review"),
    true
  );

  assert.strictEqual(
    isCharacterCreationStage("unknown"),
    false
  );
});

test("Starts at the name stage by default", () => {
  const machine =
    createCharacterCreationStageMachine();

  assert.strictEqual(
    machine.getCurrentStage(),
    CHARACTER_CREATION_STAGE.NAME
  );

  assert.deepStrictEqual(
    machine.getState(),
    {
      currentStage: "name",
      stageIndex: 0,
      stageNumber: 1,
      stageCount: 7,
      canMoveNext: true,
      canMovePrevious: false,
      complete: false
    }
  );
});

test("Moves forwards through every stage", () => {
  const machine =
    createCharacterCreationStageMachine();

  const visited = [
    machine.getCurrentStage()
  ];

  while (machine.canMoveNext()) {
    visited.push(machine.next());
  }

  assert.deepStrictEqual(
    visited,
    CHARACTER_CREATION_STAGE_ORDER
  );

  assert.strictEqual(
    machine.isComplete(),
    true
  );
});

test("Does not move beyond the finished stage", () => {
  const machine =
    createCharacterCreationStageMachine({
      initialStage:
        CHARACTER_CREATION_STAGE.FINISHED
    });

  assert.strictEqual(
    machine.next(),
    CHARACTER_CREATION_STAGE.FINISHED
  );

  assert.strictEqual(
    machine.canMoveNext(),
    false
  );
});

test("Moves backwards through the workflow", () => {
  const machine =
    createCharacterCreationStageMachine({
      initialStage:
        CHARACTER_CREATION_STAGE.REVIEW
    });

  assert.strictEqual(
    machine.previous(),
    CHARACTER_CREATION_STAGE.PROFESSION_CHOICES
  );

  assert.strictEqual(
    machine.previous(),
    CHARACTER_CREATION_STAGE.PROFESSION
  );
});

test("Does not move before the name stage", () => {
  const machine =
    createCharacterCreationStageMachine();

  assert.strictEqual(
    machine.previous(),
    CHARACTER_CREATION_STAGE.NAME
  );

  assert.strictEqual(
    machine.canMovePrevious(),
    false
  );
});

test("Moves directly to a valid stage", () => {
  const machine =
    createCharacterCreationStageMachine();

  assert.strictEqual(
    machine.moveTo(
      CHARACTER_CREATION_STAGE.SKILLS
    ),
    CHARACTER_CREATION_STAGE.SKILLS
  );

  assert.strictEqual(
    machine.getCurrentStage(),
    CHARACTER_CREATION_STAGE.SKILLS
  );
});

test("Rejects an invalid initial stage", () => {
  assert.throws(
    () =>
      createCharacterCreationStageMachine({
        initialStage: "unknown"
      }),
    /Unknown character creation stage/
  );
});

test("Rejects moving directly to an invalid stage", () => {
  const machine =
    createCharacterCreationStageMachine();

  assert.throws(
    () => machine.moveTo("unknown"),
    /Unknown character creation stage/
  );
});

test("Returns an immutable public interface and state", () => {
  const machine =
    createCharacterCreationStageMachine();

  assert.strictEqual(
    Object.isFrozen(machine),
    true
  );

  assert.strictEqual(
    Object.isFrozen(machine.getState()),
    true
  );
});

async function run() {
  console.log("================================");
  console.log(
    "CHARACTER CREATION STAGE MACHINE TESTS"
  );
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
