"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  createCharacterCreationApplication
} = require(
  "../../src/application/createCharacterCreationApplication"
);

const {
  createCharacterCreationController
} = require(
  "../../src/game/characterCreation/characterCreationController"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function withTemporarySaves(callback) {
  const savesDirectory = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "blackwall-controller-integration-"
    )
  );

  try {
    callback(savesDirectory);
  } finally {
    fs.rmSync(savesDirectory, {
      recursive: true,
      force: true
    });
  }
}

function createApplication(savesDirectory) {
  return createCharacterCreationApplication({
    savesDirectory,
    worldId: "integration-world",
    createDraftId: () =>
      "draft-integration-1",
    createCharacterId: () =>
      "character-integration-1"
  });
}

function allocateAttributes(controller) {
  const attributes = {
    force: 6,
    agility: 5,
    dexterity: 7,
    intellect: 6,
    awareness: 7,
    will: 5,
    face: 6
  };

  for (const [attributeId, value] of Object.entries(
    attributes
  )) {
    controller.submit({
      attributeId,
      value
    });
  }
}

function allocateSkills(controller) {
  const skills = {
    firearms: 4,
    stealth: 4,
    evasion: 4,
    investigation: 4,
    perception: 4,
    insight: 4
  };

  for (const [skillId, value] of Object.entries(
    skills
  )) {
    controller.submit({
      skillId,
      value
    });
  }
}

test("Completes persistent character creation end to end", () => {
  withTemporarySaves((savesDirectory) => {
    const application =
      createApplication(savesDirectory);

    const controller =
      createCharacterCreationController({
        application
      });

    let view = controller.start({
      ownerId: "cli-user-1",
      platform: "cli"
    });

    assert.strictEqual(view.stage, "name");
    assert.strictEqual(view.created, true);

    view = controller.submit({
      value: "Naoko"
    });

    assert.strictEqual(
      view.values.name,
      "Naoko"
    );

    view = controller.next();

    assert.strictEqual(
      view.stage,
      "attributes"
    );

    allocateAttributes(controller);

    view = controller.renderCurrentStep();

    assert.strictEqual(
      view.remainingPoints,
      0
    );

    view = controller.next();

    assert.strictEqual(
      view.stage,
      "skills"
    );

    allocateSkills(controller);

    view = controller.renderCurrentStep();

    assert.strictEqual(
      view.remainingPoints,
      0
    );

    view = controller.next();

    assert.strictEqual(
      view.stage,
      "profession"
    );

    view = controller.submit({
      professionId: "operator"
    });

    assert.strictEqual(
      view.values.professionId,
      "operator"
    );

    view = controller.next();

    assert.strictEqual(
      view.stage,
      "profession_choices"
    );

    view = controller.submit({
      choiceId: "weapon_type",
      value: "sniper_rifles"
    });

    assert.strictEqual(
      view.values.weapon_type,
      "sniper_rifles"
    );

    view = controller.next();

    assert.strictEqual(
      view.stage,
      "review"
    );

    assert.strictEqual(
      view.review.validation.valid,
      true
    );

    assert.strictEqual(
      view.review.readyToFinalise,
      true
    );

    assert.strictEqual(
      view.review.effectiveSkills
        .stealth.effectiveRank,
      5
    );

    view = controller.finalise({
      startingLocation: "back_alley_1",
      startingCredits: 500,
      startingInventory: [
        "unity_pistol"
      ]
    });

    assert.strictEqual(
      view.stage,
      "finished"
    );

    assert.strictEqual(
      view.complete,
      true
    );

    assert.strictEqual(
      view.character.id,
      "character-integration-1"
    );

    assert.strictEqual(
      view.character.name,
      "Naoko"
    );

    assert.strictEqual(
      view.character.location,
      "back_alley_1"
    );

    assert.strictEqual(
      view.character.credits,
      500
    );

    assert.deepStrictEqual(
      view.character.inventory,
      [
        "unity_pistol"
      ]
    );

    const characters =
      application.listCharactersByOwner({
        ownerId: "cli-user-1",
        platform: "cli"
      });

    assert.strictEqual(
      characters.length,
      1
    );

    assert.deepStrictEqual(
      characters[0],
      view.character
    );

    const finalisedDraft =
      application.loadDraft(
        "draft-integration-1"
      );

    assert.strictEqual(
      finalisedDraft.status,
      "finalised"
    );

    assert.strictEqual(
      finalisedDraft.revision,
      17
    );

    const characterFile = path.join(
      savesDirectory,
      "worlds",
      "integration-world",
      "state",
      "players",
      "character-integration-1.json"
    );

    const draftFile = path.join(
      savesDirectory,
      "worlds",
      "integration-world",
      "state",
      "characterDrafts",
      "draft-integration-1.json"
    );

    assert.strictEqual(
      fs.existsSync(characterFile),
      true
    );

    assert.strictEqual(
      fs.existsSync(draftFile),
      true
    );
  });
});

test("Resumes an unfinished controller draft", () => {
  withTemporarySaves((savesDirectory) => {
    const firstApplication =
      createApplication(savesDirectory);

    const firstController =
      createCharacterCreationController({
        application: firstApplication
      });

    firstController.start({
      ownerId: "cli-user-1",
      platform: "cli"
    });

    firstController.submit({
      value: "Naoko"
    });

    const secondApplication =
      createApplication(savesDirectory);

    const secondController =
      createCharacterCreationController({
        application: secondApplication
      });

    const resumed = secondController.start({
      ownerId: "cli-user-1",
      platform: "cli"
    });

    assert.strictEqual(
      resumed.created,
      false
    );

    assert.strictEqual(
      resumed.values.name,
      "Naoko"
    );

    assert.strictEqual(
      resumed.revision,
      1
    );
  });
});

async function run() {
  console.log("================================");
  console.log(
    "CHARACTER CREATION CONTROLLER INTEGRATION TESTS"
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
