"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  createCharacterFinalizationService
} = require("../../src/game/characterCreation/characterFinalizationService");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createCompleteDraft() {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "discord-user-1",
    platform: "discord",
    worldId: "development-world"
  });

  draft.identity.name = "Naoko";

  draft.attributes = {
    force: 6,
    agility: 5,
    dexterity: 7,
    intellect: 6,
    awareness: 7,
    will: 5,
    face: 6
  };

  draft.skills.firearms = 4;
  draft.skills.stealth = 4;
  draft.skills.evasion = 4;
  draft.skills.investigation = 4;
  draft.skills.perception = 4;
  draft.skills.insight = 4;

  draft.profession = "operator";
  draft.professionChoices.weapon_type =
    "sniper_rifles";

  return draft;
}

function createMemoryDraftRepository() {
  return {
    saved: [],

    save(draft, expectedRevision) {
      this.saved.push({
        draft: structuredClone(draft),
        expectedRevision
      });

      return draft;
    }
  };
}

function createMemoryCharacterRepository() {
  const characters = [];

  return {
    create(character) {
      if (
        characters.some(
          (existing) =>
            existing.id === character.id
        )
      ) {
        throw new Error(
          `Character ${character.id} already exists.`
        );
      }

      characters.push(
        structuredClone(character)
      );

      return character;
    },

    findByCreationDraftId(draftId) {
      const character = characters.find(
        (candidate) =>
          candidate.characterCreation.draftId ===
          draftId
      );

      return character
        ? structuredClone(character)
        : null;
    },

    all() {
      return structuredClone(characters);
    }
  };
}

function createService({
  draftRepository =
    createMemoryDraftRepository(),
  characterRepository =
    createMemoryCharacterRepository()
} = {}) {
  return {
    draftRepository,
    characterRepository,
    service:
      createCharacterFinalizationService({
        draftRepository,
        characterRepository,
        createCharacterId: ({ draft }) =>
          `character-${draft.id}`
      })
  };
}

test("Creates a permanent character and finalises the draft", () => {
  const {
    service,
    draftRepository,
    characterRepository
  } = createService();

  const result = service.finalise({
    draft: createCompleteDraft(),
    expectedRevision: 0,
    startingLocation: "back_alley_1",
    startingCredits: 500,
    startingInventory: [
      "unity_pistol"
    ]
  });

  assert.strictEqual(result.created, true);
  assert.strictEqual(
    result.character.id,
    "character-draft-1"
  );

  assert.strictEqual(
    result.finalisedDraft.status,
    "finalised"
  );

  assert.strictEqual(
    result.finalisedDraft.revision,
    1
  );

  assert.strictEqual(
    characterRepository.all().length,
    1
  );

  assert.strictEqual(
    draftRepository.saved.length,
    1
  );

  assert.strictEqual(
    draftRepository.saved[0].expectedRevision,
    0
  );
});

test("Returns the existing character on repeat finalisation", () => {
  const setup = createService();
  const draft = createCompleteDraft();

  const first = setup.service.finalise({
    draft,
    expectedRevision: 0,
    startingLocation: "back_alley_1"
  });

  const second = setup.service.finalise({
    draft: first.finalisedDraft,
    expectedRevision: 1,
    startingLocation: "back_alley_1"
  });

  assert.strictEqual(first.created, true);
  assert.strictEqual(second.created, false);

  assert.deepStrictEqual(
    second.character,
    first.character
  );

  assert.strictEqual(
    setup.characterRepository.all().length,
    1
  );

  assert.strictEqual(
    setup.draftRepository.saved.length,
    1
  );
});

test("Repairs an in-progress draft when the character already exists", () => {
  const setup = createService();
  const draft = createCompleteDraft();

  const first = setup.service.finalise({
    draft,
    expectedRevision: 0,
    startingLocation: "back_alley_1"
  });

  setup.draftRepository.saved.length = 0;

  const recovered = setup.service.finalise({
    draft,
    expectedRevision: 0,
    startingLocation: "back_alley_1"
  });

  assert.strictEqual(recovered.created, false);

  assert.strictEqual(
    recovered.finalisedDraft.status,
    "finalised"
  );

  assert.strictEqual(
    recovered.finalisedDraft.revision,
    1
  );

  assert.strictEqual(
    recovered.finalisedDraft.finalCharacterId,
    first.character.id
  );

  assert.strictEqual(
    setup.characterRepository.all().length,
    1
  );

  assert.strictEqual(
    setup.draftRepository.saved.length,
    1
  );
});

test("Passes starting state into the character record", () => {
  const { service } = createService();

  const result = service.finalise({
    draft: createCompleteDraft(),
    expectedRevision: 0,
    startingLocation: "safehouse_1",
    startingCredits: 750,
    startingInventory: [
      "unity_pistol",
      "protein_bar"
    ]
  });

  assert.strictEqual(
    result.character.location,
    "safehouse_1"
  );

  assert.strictEqual(
    result.character.credits,
    750
  );

  assert.deepStrictEqual(
    result.character.inventory,
    [
      "unity_pistol",
      "protein_bar"
    ]
  );
});

test("Rejects invalid service dependencies", () => {
  assert.throws(
    () =>
      createCharacterFinalizationService({
        draftRepository: {},
        characterRepository: {},
        createCharacterId: () =>
          "character-1"
      }),
    /draftRepository.save must be a function/
  );
});

test("Returns an immutable service interface", () => {
  const { service } = createService();

  assert.strictEqual(
    Object.isFrozen(service),
    true
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER FINALIZATION SERVICE TESTS");
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