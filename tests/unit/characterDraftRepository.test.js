"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  updateCharacterName
} = require("../../src/game/characterCreation/characterDraftUpdater");

const {
  CharacterDraftRepositoryError,
  createCharacterDraftRepository
} = require("../../src/game/characterCreation/characterDraftRepository");

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
      "blackwall-character-drafts-"
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

function createDraft(overrides = {}) {
  return {
    ...createCharacterDraft({
      id: "draft-1",
      ownerId: "discord-user-1",
      platform: "discord",
      worldId: "test-world"
    }),
    ...overrides
  };
}

function assertRepositoryError(
  callback,
  expectedCode
) {
  assert.throws(
    callback,
    (error) => {
      assert.strictEqual(
        error instanceof
          CharacterDraftRepositoryError,
        true
      );

      assert.strictEqual(
        error.code,
        expectedCode
      );

      return true;
    }
  );
}

test("Creates and loads a persisted draft", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const draft = createDraft();

    repository.create(draft);

    assert.deepStrictEqual(
      repository.load(draft.id),
      draft
    );
  });
});

test("Returns null when a draft does not exist", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    assert.strictEqual(
      repository.load("missing-draft"),
      null
    );
  });
});

test("Rejects duplicate draft creation", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const draft = createDraft();

    repository.create(draft);

    assertRepositoryError(
      () => repository.create(draft),
      "draft_already_exists"
    );
  });
});

test("Saves the next revision", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const original = createDraft();

    repository.create(original);

    const updated = updateCharacterName({
      draft: original,
      expectedRevision: 0,
      name: "Naoko"
    });

    repository.save(updated, 0);

    assert.deepStrictEqual(
      repository.load(updated.id),
      updated
    );
  });
});

test("Rejects stale revision saves", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const original = createDraft();

    repository.create(original);

    const first = updateCharacterName({
      draft: original,
      expectedRevision: 0,
      name: "Naoko"
    });

    repository.save(first, 0);

    const stale = updateCharacterName({
      draft: original,
      expectedRevision: 0,
      name: "Runner"
    });

    assertRepositoryError(
      () => repository.save(stale, 0),
      "draft_revision_conflict"
    );
  });
});

test("Finds an active draft by owner and platform", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const draft = createDraft();

    repository.create(draft);

    assert.deepStrictEqual(
      repository.findActiveByOwner({
        ownerId: "discord-user-1",
        platform: "discord",
        worldId: "test-world"
      }),
      draft
    );
  });
});

test("Ignores completed drafts during active lookup", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    repository.create(
      createDraft({
        status: "finalised"
      })
    );

    assert.strictEqual(
      repository.findActiveByOwner({
        ownerId: "discord-user-1",
        platform: "discord",
        worldId: "test-world"
      }),
      null
    );
  });
});

test("Rejects drafts belonging to another world", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterDraftRepository({
        savesDirectory,
        worldId: "test-world"
      });

    assertRepositoryError(
      () =>
        repository.create(
          createDraft({
            worldId: "other-world"
          })
        ),
      "wrong_world"
    );
  });
});

async function run() {
  console.log("================================");
  console.log("CHARACTER DRAFT REPOSITORY TESTS");
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