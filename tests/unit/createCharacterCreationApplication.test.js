"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  createCharacterCreationApplication
} = require("../../src/application/createCharacterCreationApplication");

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
      "blackwall-character-app-"
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
  let draftCounter = 0;
  let characterCounter = 0;

  return createCharacterCreationApplication({
    savesDirectory,
    worldId: "test-world",
    createDraftId: () => {
      draftCounter += 1;
      return `draft-${draftCounter}`;
    },
    createCharacterId: () => {
      characterCounter += 1;
      return `character-${characterCounter}`;
    }
  });
}

function completeDraft(application, draft) {
  let current = draft;

  current = application.setName({
    draft: current,
    expectedRevision: current.revision,
    name: "Naoko"
  }).draft;

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
    current = application.setAttribute({
      draft: current,
      expectedRevision: current.revision,
      attributeId,
      value
    }).draft;
  }

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
    current = application.setSkill({
      draft: current,
      expectedRevision: current.revision,
      skillId,
      value
    }).draft;
  }

  current = application.setProfession({
    draft: current,
    expectedRevision: current.revision,
    professionId: "operator"
  }).draft;

  current = application.setProfessionChoice({
    draft: current,
    expectedRevision: current.revision,
    choiceId: "weapon_type",
    value: "sniper_rifles"
  }).draft;

  return current;
}

test("Creates and resumes persistent drafts", () => {
  withTemporarySaves((savesDirectory) => {
    const firstApplication =
      createApplication(savesDirectory);

    const first =
      firstApplication.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    assert.strictEqual(first.created, true);

    const secondApplication =
      createApplication(savesDirectory);

    const resumed =
      secondApplication.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    assert.strictEqual(resumed.created, false);

    assert.deepStrictEqual(
      resumed.draft,
      first.draft
    );
  });
});

test("Persists revision-safe draft updates", () => {
  withTemporarySaves((savesDirectory) => {
    const application =
      createApplication(savesDirectory);

    const started =
      application.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    const updated = application.setName({
      draft: started.draft,
      expectedRevision: 0,
      name: "Naoko"
    });

    assert.strictEqual(
      updated.draft.revision,
      1
    );

    assert.deepStrictEqual(
      application.loadDraft(
        updated.draft.id
      ),
      updated.draft
    );
  });
});

test("Finalises a complete draft into permanent storage", () => {
  withTemporarySaves((savesDirectory) => {
    const application =
      createApplication(savesDirectory);

    const started =
      application.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    const complete = completeDraft(
      application,
      started.draft
    );

    const result = application.finalise({
      draft: complete,
      expectedRevision: complete.revision,
      startingLocation: "back_alley_1",
      startingCredits: 500,
      startingInventory: [
        "unity_pistol"
      ]
    });

    assert.strictEqual(result.created, true);

    assert.strictEqual(
      result.character.name,
      "Naoko"
    );

    assert.strictEqual(
      result.character.profession.id,
      "operator"
    );

    assert.strictEqual(
      result.finalisedDraft.status,
      "finalised"
    );

    assert.deepStrictEqual(
      application.listCharactersByOwner({
        ownerId: "discord-user-1",
        platform: "discord"
      }),
      [
        result.character
      ]
    );
  });
});

test("Does not resume a finalised draft", () => {
  withTemporarySaves((savesDirectory) => {
    const application =
      createApplication(savesDirectory);

    const started =
      application.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    const complete = completeDraft(
      application,
      started.draft
    );

    application.finalise({
      draft: complete,
      expectedRevision: complete.revision,
      startingLocation: "back_alley_1"
    });

    const next =
      application.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    assert.strictEqual(next.created, true);

    assert.notStrictEqual(
      next.draft.id,
      started.draft.id
    );
  });
});

test("Keeps worlds isolated", () => {
  withTemporarySaves((savesDirectory) => {
    const first =
      createCharacterCreationApplication({
        savesDirectory,
        worldId: "first-world",
        createDraftId: () =>
          "draft-first",
        createCharacterId: () =>
          "character-first"
      });

    const second =
      createCharacterCreationApplication({
        savesDirectory,
        worldId: "second-world",
        createDraftId: () =>
          "draft-second",
        createCharacterId: () =>
          "character-second"
      });

    first.startOrResume({
      ownerId: "discord-user-1",
      platform: "discord"
    });

    const secondDraft =
      second.startOrResume({
        ownerId: "discord-user-1",
        platform: "discord"
      });

    assert.strictEqual(
      secondDraft.created,
      true
    );

    assert.strictEqual(
      secondDraft.draft.worldId,
      "second-world"
    );
  });
});

test("Returns an immutable application interface", () => {
  withTemporarySaves((savesDirectory) => {
    const application =
      createApplication(savesDirectory);

    assert.strictEqual(
      Object.isFrozen(application),
      true
    );

    assert.strictEqual(
      application.worldId,
      "test-world"
    );
  });
});

async function run() {
  console.log("================================");
  console.log("CHARACTER CREATION APPLICATION TESTS");
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