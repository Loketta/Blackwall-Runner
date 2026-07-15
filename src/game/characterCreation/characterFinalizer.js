"use strict";

const {
  CHARACTER_DRAFT_STATUS
} = require("./characterDraft");

const {
  validateCharacterDraft
} = require("./characterCreationValidator");

const {
  getProfessionDefinition
} = require("./professionDefinitions");

class CharacterFinalizationError extends Error {
  constructor(code, field, message, validation = null) {
    super(message);

    this.name = "CharacterFinalizationError";
    this.code = code;
    this.field = field;
    this.validation = validation;
  }
}

function createFinalizationError(
  code,
  field,
  message,
  validation = null
) {
  return new CharacterFinalizationError(
    code,
    field,
    message,
    validation
  );
}

function requireNonEmptyString(value, fieldName) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw createFinalizationError(
      "invalid_required_value",
      fieldName,
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function calculateMobility(attributes) {
  if (!attributes || typeof attributes !== "object") {
    throw createFinalizationError(
      "invalid_attributes",
      "attributes",
      "Core attributes are required."
    );
  }

  const force = attributes.force;
  const agility = attributes.agility;
  const dexterity = attributes.dexterity;

  for (const [attributeId, value] of Object.entries({
    force,
    agility,
    dexterity
  })) {
    if (!Number.isInteger(value)) {
      throw createFinalizationError(
        "invalid_attribute_value",
        `attributes.${attributeId}`,
        `${attributeId} must be a whole number.`
      );
    }
  }

  return Math.floor(
    (force + Math.max(agility, dexterity)) / 2
  );
}

function cloneRecord(value) {
  return JSON.parse(JSON.stringify(value));
}

function finaliseCharacterDraft({
  draft,
  characterId,
  startingLocation,
  startingCredits = 0,
  startingInventory = []
}) {
  if (!draft || typeof draft !== "object") {
    throw createFinalizationError(
      "invalid_draft",
      "draft",
      "Character draft must be an object."
    );
  }

  if (
    draft.status !==
    CHARACTER_DRAFT_STATUS.IN_PROGRESS
  ) {
    throw createFinalizationError(
      "draft_already_completed",
      "status",
      "Only an in-progress draft may be finalised."
    );
  }

  const validation = validateCharacterDraft(draft);

  if (!validation.valid) {
    throw createFinalizationError(
      "draft_validation_failed",
      "draft",
      "The character draft does not pass validation.",
      validation
    );
  }

  const name = requireNonEmptyString(
    draft.identity?.name,
    "identity.name"
  );

  const id = requireNonEmptyString(
    characterId,
    "characterId"
  );

  const location = requireNonEmptyString(
    startingLocation,
    "startingLocation"
  );

  if (
    !Number.isInteger(startingCredits) ||
    startingCredits < 0
  ) {
    throw createFinalizationError(
      "invalid_starting_credits",
      "startingCredits",
      "Starting credits must be a non-negative whole number."
    );
  }

  if (!Array.isArray(startingInventory)) {
    throw createFinalizationError(
      "invalid_starting_inventory",
      "startingInventory",
      "Starting inventory must be an array."
    );
  }

  const profession = getProfessionDefinition(
    draft.profession
  );

  const character = {
    id,
    name,
    ownerId: draft.ownerId,
    platform: draft.platform,
    worldId: draft.worldId,
    profession: {
      id: profession.id,
      name: profession.name,
      level: 1,
      choices: cloneRecord(
        draft.professionChoices
      )
    },
    attributes: cloneRecord(draft.attributes),
    derived: {
      mobility: calculateMobility(
        draft.attributes
      )
    },
    skills: cloneRecord(draft.skills),
    credits: startingCredits,
    location,
    inventory: cloneRecord(startingInventory),
    characterCreation: {
      draftId: draft.id,
      definitionVersion:
        draft.definitionVersion
    }
  };

  const finalisedDraft = {
    ...cloneRecord(draft),
    status: CHARACTER_DRAFT_STATUS.FINALISED,
    revision: draft.revision + 1,
    finalCharacterId: id
  };

  return {
    character,
    finalisedDraft
  };
}

module.exports = {
  CharacterFinalizationError,
  calculateMobility,
  finaliseCharacterDraft
};