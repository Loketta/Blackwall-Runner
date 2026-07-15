"use strict";

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES,
  CHARACTER_CREATION_STAGES
} = require("./characterCreationDefinition");

const {
  SKILL_DEFINITIONS,
  SKILL_CREATION_RULES
} = require("./skillDefinitions");

const CHARACTER_DRAFT_STATUS = Object.freeze({
  IN_PROGRESS: "in_progress",
  FINALISED: "finalised",
  ABANDONED: "abandoned"
});

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new TypeError(`${fieldName} must be a non-empty string.`);
  }

  return value.trim();
}

function createStartingAttributes() {
  return Object.fromEntries(
    CORE_ATTRIBUTES.map((attributeId) => [
      attributeId,
      ATTRIBUTE_RULES.minimum
    ])
  );
}

function createStartingSkills() {
  return Object.fromEntries(
    SKILL_DEFINITIONS.map((skill) => [
      skill.id,
      SKILL_CREATION_RULES.minimum
    ])
  );
}

function createCharacterDraft({
  id,
  ownerId,
  platform,
  worldId
}) {
  return {
    id: requireNonEmptyString(id, "id"),
    ownerId: requireNonEmptyString(ownerId, "ownerId"),
    platform: requireNonEmptyString(platform, "platform"),
    worldId: requireNonEmptyString(worldId, "worldId"),
    definitionVersion: 1,
    revision: 0,
    status: CHARACTER_DRAFT_STATUS.IN_PROGRESS,
    currentStage: CHARACTER_CREATION_STAGES[0],
    identity: {
      name: null
    },
    attributes: createStartingAttributes(),
    skills: createStartingSkills(),
    profession: null,
    professionChoices: {},
    completedStages: []
  };
}

module.exports = {
  CHARACTER_DRAFT_STATUS,
  createStartingAttributes,
  createStartingSkills,
  createCharacterDraft
};