"use strict";

const assert = require("assert");

const {
  createCharacterCreationService
} = require("../../src/game/characterCreation/characterCreationService");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createMemoryRepository() {
  const drafts = new Map();

  return {
    create(draft) {
      if (drafts.has(draft.id)) {
        throw new Error(
          `Draft ${draft.id} already exists.`
        );
      }

      drafts.set(
        draft.id,
        structuredClone(draft)
      );

      return draft;
    },

    save(draft, expectedRevision) {
      const persisted = drafts.get(draft.id);

      if (!persisted) {
        throw new Error(
          `Draft ${draft.id} does not exist.`
        );
      }

      if (
        persisted.revision !==
        expectedRevision
      ) {
        throw new Error(
          "Draft revision conflict."
        );
      }

      drafts.set(
        draft.id,
        structuredClone(draft)
      );

      return draft;
    },

    findActiveByOwner({
      ownerId,
      platform,
      worldId
    }) {
      for (const draft of drafts.values()) {
        if (
          draft.ownerId === ownerId &&
          draft.platform === platform &&
          draft.worldId === worldId &&
          draft.status === "in_progress"
        ) {
          return structuredClone(draft);
        }
      }

      return null;
    },

    load(draftId) {
      const draft = drafts.get(draftId);

      return draft
        ? structuredClone(draft)
        : null;
    }
  };
}

function createService(repository) {
  return createCharacterCreationService({
    repository,
    createDraftId: ({
      ownerId,
      worldId
    }) => `${worldId}-${ownerId}-draft`
  });
}

test("Creates a new draft when none exists", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const result = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  assert.strictEqual(result.created, true);
  assert.strictEqual(
    result.draft.id,
    "development-world-discord-user-1-draft"
  );
  assert.strictEqual(
    result.draft.revision,
    0
  );
  assert.strictEqual(
    result.validation.valid,
    false
  );
});

test("Resumes an existing active draft", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const first = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const second = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  assert.strictEqual(first.created, true);
  assert.strictEqual(second.created, false);
  assert.deepStrictEqual(
    second.draft,
    first.draft
  );
});

test("Updates and persists a character name", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const started = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const result = service.setName({
    draft: started.draft,
    expectedRevision: 0,
    name: "Naoko"
  });

  assert.strictEqual(
    result.draft.identity.name,
    "Naoko"
  );

  assert.strictEqual(
    result.draft.revision,
    1
  );

  assert.deepStrictEqual(
    repository.load(result.draft.id),
    result.draft
  );
});

test("Updates attributes through the shared updater", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const started = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const result = service.setAttribute({
    draft: started.draft,
    expectedRevision: 0,
    attributeId: "force",
    value: 8
  });

  assert.strictEqual(
    result.draft.attributes.force,
    8
  );

  assert.strictEqual(
    result.draft.revision,
    1
  );
});

test("Updates skills through the shared updater", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const started = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const result = service.setSkill({
    draft: started.draft,
    expectedRevision: 0,
    skillId: "firearms",
    value: 4
  });

  assert.strictEqual(
    result.draft.skills.firearms,
    4
  );
});

test("Updates professions and profession choices", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const started = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const professionResult =
    service.setProfession({
      draft: started.draft,
      expectedRevision: 0,
      professionId: "operator"
    });

  const choiceResult =
    service.setProfessionChoice({
      draft: professionResult.draft,
      expectedRevision: 1,
      choiceId: "weapon_type",
      value: "sniper_rifles"
    });

  assert.strictEqual(
    choiceResult.draft.profession,
    "operator"
  );

  assert.strictEqual(
    choiceResult.draft
      .professionChoices
      .weapon_type,
    "sniper_rifles"
  );

  assert.strictEqual(
    choiceResult.draft.revision,
    2
  );
});

test("Returns current validation after updates", () => {
  const repository = createMemoryRepository();
  const service = createService(repository);

  const started = service.startOrResume({
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  const result = service.setProfession({
    draft: started.draft,
    expectedRevision: 0,
    professionId: "medic"
  });

  assert.strictEqual(
    result.validation.valid,
    false
  );

  assert.strictEqual(
    result.validation.errors.some(
      (error) =>
        error.code ===
        "profession_required"
    ),
    false
  );
});

test("Rejects invalid repository dependencies", () => {
  assert.throws(
    () =>
      createCharacterCreationService({
        repository: {},
        createDraftId: () => "draft-1"
      }),
    /repository.create must be a function/
  );
});

test("Returns an immutable service interface", () => {
  const service = createService(
    createMemoryRepository()
  );

  assert.strictEqual(
    Object.isFrozen(service),
    true
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER CREATION SERVICE TESTS");
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