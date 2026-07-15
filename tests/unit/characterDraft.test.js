"use strict";

const assert = require("assert");

const {
  CHARACTER_DRAFT_STATUS,
  createStartingAttributes,
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Creates attributes at the creation minimum", () => {
  assert.deepStrictEqual(createStartingAttributes(), {
    force: 2,
    agility: 2,
    dexterity: 2,
    intellect: 2,
    awareness: 2,
    will: 2,
    face: 2
  });
});

test("Creates an in-progress character draft", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  assert.deepStrictEqual(draft, {
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world",
    definitionVersion: 1,
    revision: 0,
    status: CHARACTER_DRAFT_STATUS.IN_PROGRESS,
    currentStage: "identity",
    identity: {
      name: null
    },
    attributes: {
      force: 2,
      agility: 2,
      dexterity: 2,
      intellect: 2,
      awareness: 2,
      will: 2,
      face: 2
    },
    skills: {},
    profession: null,
    professionChoices: {},
    completedStages: []
  });
});

test("Rejects missing ownership information", () => {
  assert.throws(
    () =>
      createCharacterDraft({
        id: "draft-1",
        ownerId: "",
        platform: "discord",
        worldId: "development-world"
      }),
    /ownerId must be a non-empty string/
  );
});

test("Creates independent attribute objects", () => {
  const first = createStartingAttributes();
  const second = createStartingAttributes();

  first.force = 8;

  assert.strictEqual(second.force, 2);
});

async function run() {
  console.log("================================");
  console.log("CHARACTER DRAFT TESTS");
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