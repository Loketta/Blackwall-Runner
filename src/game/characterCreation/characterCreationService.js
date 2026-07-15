"use strict";

const {
  createCharacterDraft
} = require("./characterDraft");

const {
  validateCharacterDraft
} = require("./characterCreationValidator");

const {
  updateCharacterName,
  updateCharacterAttribute,
  updateCharacterSkill,
  updateCharacterProfession,
  updateCharacterProfessionChoice
} = require("./characterDraftUpdater");

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function requireRepository(repository) {
  if (!repository || typeof repository !== "object") {
    throw new TypeError(
      "repository must be an object."
    );
  }

  for (const methodName of [
    "create",
    "save",
    "findActiveByOwner"
  ]) {
    requireFunction(
      repository[methodName],
      `repository.${methodName}`
    );
  }

  return repository;
}

function requireNonEmptyString(value, fieldName) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function createCharacterCreationService({
  repository,
  createDraftId
}) {
  const draftRepository =
    requireRepository(repository);

  const draftIdFactory =
    requireFunction(
      createDraftId,
      "createDraftId"
    );

  function startOrResume({
    ownerId,
    platform,
    worldId
  }) {
    const normalisedOwnerId =
      requireNonEmptyString(
        ownerId,
        "ownerId"
      );

    const normalisedPlatform =
      requireNonEmptyString(
        platform,
        "platform"
      );

    const normalisedWorldId =
      requireNonEmptyString(
        worldId,
        "worldId"
      );

    const existingDraft =
      draftRepository.findActiveByOwner({
        ownerId: normalisedOwnerId,
        platform: normalisedPlatform,
        worldId: normalisedWorldId
      });

    if (existingDraft) {
      return {
        created: false,
        draft: existingDraft,
        validation:
          validateCharacterDraft(existingDraft)
      };
    }

    const draftId =
      requireNonEmptyString(
        draftIdFactory({
          ownerId: normalisedOwnerId,
          platform: normalisedPlatform,
          worldId: normalisedWorldId
        }),
        "created draft id"
      );

    const draft = createCharacterDraft({
      id: draftId,
      ownerId: normalisedOwnerId,
      platform: normalisedPlatform,
      worldId: normalisedWorldId
    });

    draftRepository.create(draft);

    return {
      created: true,
      draft,
      validation:
        validateCharacterDraft(draft)
    };
  }

  function applyUpdate({
    draft,
    expectedRevision,
    update,
    updateArguments = {}
  }) {
    requireFunction(update, "update");

    const updatedDraft = update({
      draft,
      expectedRevision,
      ...updateArguments
    });

    draftRepository.save(
      updatedDraft,
      expectedRevision
    );

    return {
      draft: updatedDraft,
      validation:
        validateCharacterDraft(updatedDraft)
    };
  }

  function setName({
    draft,
    expectedRevision,
    name
  }) {
    return applyUpdate({
      draft,
      expectedRevision,
      update: updateCharacterName,
      updateArguments: {
        name
      }
    });
  }

  function setAttribute({
    draft,
    expectedRevision,
    attributeId,
    value
  }) {
    return applyUpdate({
      draft,
      expectedRevision,
      update: updateCharacterAttribute,
      updateArguments: {
        attributeId,
        value
      }
    });
  }

  function setSkill({
    draft,
    expectedRevision,
    skillId,
    value
  }) {
    return applyUpdate({
      draft,
      expectedRevision,
      update: updateCharacterSkill,
      updateArguments: {
        skillId,
        value
      }
    });
  }

  function setProfession({
    draft,
    expectedRevision,
    professionId
  }) {
    return applyUpdate({
      draft,
      expectedRevision,
      update: updateCharacterProfession,
      updateArguments: {
        professionId
      }
    });
  }

  function setProfessionChoice({
    draft,
    expectedRevision,
    choiceId,
    value
  }) {
    return applyUpdate({
      draft,
      expectedRevision,
      update:
        updateCharacterProfessionChoice,
      updateArguments: {
        choiceId,
        value
      }
    });
  }

  function validate(draft) {
    return validateCharacterDraft(draft);
  }

  return Object.freeze({
    startOrResume,
    setName,
    setAttribute,
    setSkill,
    setProfession,
    setProfessionChoice,
    validate
  });
}

module.exports = {
  createCharacterCreationService
};