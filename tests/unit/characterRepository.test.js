"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");

const {
  CharacterRepositoryError,
  createCharacterRepository
} = require("../../src/game/characterCreation/characterRepository");

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
      "blackwall-characters-"
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

function createCharacter(overrides = {}) {
  return {
    id: "character-naoko",
    name: "Naoko",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "test-world",
    profession: {
      id: "operator",
      name: "Operator",
      level: 1,
      choices: {
        weapon_type: "sniper_rifles"
      }
    },
    attributes: {
      force: 6,
      agility: 5,
      dexterity: 7,
      intellect: 6,
      awareness: 7,
      will: 5,
      face: 6
    },
    derived: {
      mobility: 6
    },
    skills: {
      firearms: 4
    },
    credits: 500,
    location: "back_alley_1",
    inventory: [],
    characterCreation: {
      draftId: "draft-1",
      definitionVersion: 1
    },
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
        error instanceof CharacterRepositoryError,
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

test("Creates and loads a permanent character", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const character = createCharacter();

    repository.create(character);

    assert.deepStrictEqual(
      repository.load(character.id),
      character
    );
  });
});

test("Returns null for a missing character", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    assert.strictEqual(
      repository.load("missing-character"),
      null
    );
  });
});

test("Reports whether a character exists", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const character = createCharacter();

    assert.strictEqual(
      repository.exists(character.id),
      false
    );

    repository.create(character);

    assert.strictEqual(
      repository.exists(character.id),
      true
    );
  });
});

test("Rejects duplicate character ids", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const character = createCharacter();

    repository.create(character);

    assertRepositoryError(
      () => repository.create(character),
      "character_already_exists"
    );
  });
});

test("Finds a character by creation draft id", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const character = createCharacter();

    repository.create(character);

    assert.deepStrictEqual(
      repository.findByCreationDraftId(
        "draft-1"
      ),
      character
    );
  });
});

test("Prevents one draft creating multiple characters", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    repository.create(
      createCharacter()
    );

    assertRepositoryError(
      () =>
        repository.create(
          createCharacter({
            id: "character-second"
          })
        ),
      "creation_draft_already_used"
    );
  });
});

test("Finds characters by owner and platform", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const first = createCharacter();

    const second = createCharacter({
      id: "character-second",
      name: "Second",
      characterCreation: {
        draftId: "draft-2",
        definitionVersion: 1
      }
    });

    const otherOwner = createCharacter({
      id: "character-other",
      name: "Other",
      ownerId: "discord-user-2",
      characterCreation: {
        draftId: "draft-3",
        definitionVersion: 1
      }
    });

    repository.create(first);
    repository.create(second);
    repository.create(otherOwner);

    assert.deepStrictEqual(
      repository.findByOwner({
        ownerId: "discord-user-1",
        platform: "discord"
      }),
      [
        first,
        second
      ]
    );
  });
});

test("Rejects characters belonging to another world", () => {
  withTemporarySaves((savesDirectory) => {
    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    assertRepositoryError(
      () =>
        repository.create(
          createCharacter({
            worldId: "other-world"
          })
        ),
      "wrong_world"
    );
  });
});

test("Coexists with legacy player files", () => {
  withTemporarySaves((savesDirectory) => {
    const playersDirectory = path.join(
      savesDirectory,
      "worlds",
      "test-world",
      "state",
      "players"
    );

    fs.mkdirSync(playersDirectory, {
      recursive: true
    });

    fs.writeFileSync(
      path.join(
        playersDirectory,
        "runner.json"
      ),
      JSON.stringify(
        {
          id: "player_runner_1",
          name: "Runner"
        },
        null,
        4
      )
    );

    const repository =
      createCharacterRepository({
        savesDirectory,
        worldId: "test-world"
      });

    const character = createCharacter();

    repository.create(character);

    assert.strictEqual(
      repository.list().length,
      2
    );

    assert.deepStrictEqual(
      repository.findByCreationDraftId(
        "draft-1"
      ),
      character
    );
  });
});

async function run() {
  console.log("================================");
  console.log("CHARACTER REPOSITORY TESTS");
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