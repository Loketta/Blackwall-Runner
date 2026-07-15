"use strict";

const {
  CHARACTER_DRAFT_STATUS
} = require("./characterDraft");

const {
  finaliseCharacterDraft
} = require("./characterFinalizer");

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function requireRepository(
  repository,
  fieldName,
  requiredMethods
) {
  if (!repository || typeof repository !== "object") {
    throw new TypeError(
      `${fieldName} must be an object.`
    );
  }

  for (const methodName of requiredMethods) {
    requireFunction(
      repository[methodName],
      `${fieldName}.${methodName}`
    );
  }

  return repository;
}

function createRecoveredFinalisedDraft({
  draft,
  characterId,
  expectedRevision
}) {
  if (
    draft.status ===
    CHARACTER_DRAFT_STATUS.FINALISED
  ) {
    return draft;
  }

  if (
    draft.status !==
    CHARACTER_DRAFT_STATUS.IN_PROGRESS
  ) {
    throw new Error(
      "Only an in-progress or finalised draft may be recovered."
    );
  }

  if (draft.revision !== expectedRevision) {
    throw new Error(
      `Expected draft revision ${expectedRevision}, but received ${draft.revision}.`
    );
  }

  return {
    ...draft,
    status: CHARACTER_DRAFT_STATUS.FINALISED,
    revision: expectedRevision + 1,
    finalCharacterId: characterId
  };
}

function createCharacterFinalizationService({
  draftRepository,
  characterRepository,
  createCharacterId
}) {
  const drafts = requireRepository(
    draftRepository,
    "draftRepository",
    ["save"]
  );

  const characters = requireRepository(
    characterRepository,
    "characterRepository",
    [
      "create",
      "findByCreationDraftId"
    ]
  );

  const characterIdFactory = requireFunction(
    createCharacterId,
    "createCharacterId"
  );

  function finalise({
    draft,
    expectedRevision,
    startingLocation,
    startingCredits = 0,
    startingInventory = []
  }) {
    if (!draft || typeof draft !== "object") {
      throw new TypeError(
        "draft must be an object."
      );
    }

    if (!Number.isInteger(expectedRevision)) {
      throw new TypeError(
        "expectedRevision must be a whole number."
      );
    }

    const existingCharacter =
      characters.findByCreationDraftId(
        draft.id
      );

    if (existingCharacter) {
      const finalisedDraft =
        createRecoveredFinalisedDraft({
          draft,
          characterId: existingCharacter.id,
          expectedRevision
        });

      if (
        finalisedDraft !== draft
      ) {
        drafts.save(
          finalisedDraft,
          expectedRevision
        );
      }

      return {
        created: false,
        character: existingCharacter,
        finalisedDraft
      };
    }

    const characterId = characterIdFactory({
      draft
    });

    const result = finaliseCharacterDraft({
      draft,
      characterId,
      startingLocation,
      startingCredits,
      startingInventory
    });

    /*
     * Character creation happens first.
     *
     * If saving the finalised draft subsequently fails, a retry
     * finds the existing character by draft id and repairs the
     * draft without creating a duplicate character.
     */
    characters.create(result.character);

    drafts.save(
      result.finalisedDraft,
      expectedRevision
    );

    return {
      created: true,
      character: result.character,
      finalisedDraft:
        result.finalisedDraft
    };
  }

  return Object.freeze({
    finalise
  });
}

module.exports = {
  createCharacterFinalizationService
};