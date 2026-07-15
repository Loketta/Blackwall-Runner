"use strict";

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES
} = require("./characterCreationDefinition");

const {
  SKILL_CREATION_RULES,
  getSkillDefinition
} = require("./skillDefinitions");

const {
  CHARACTER_DRAFT_STATUS
} = require("./characterDraft");

const {
  getProfessionDefinition
} = require("./professionDefinitions");

const {
  getWeaponTypeDefinition
} = require("./weaponTypeDefinitions");

class CharacterDraftUpdateError extends Error {
  constructor(code, field, message) {
    super(message);

    this.name = "CharacterDraftUpdateError";
    this.code = code;
    this.field = field;
  }
}

function createUpdateError(code, field, message) {
  return new CharacterDraftUpdateError(
    code,
    field,
    message
  );
}

function requireDraft(draft) {
  if (!draft || typeof draft !== "object") {
    throw createUpdateError(
      "invalid_draft",
      "draft",
      "Character draft must be an object."
    );
  }

  if (
    draft.status !==
    CHARACTER_DRAFT_STATUS.IN_PROGRESS
  ) {
    throw createUpdateError(
      "draft_not_editable",
      "status",
      "Only an in-progress character draft may be edited."
    );
  }

  if (!Number.isInteger(draft.revision)) {
    throw createUpdateError(
      "invalid_revision",
      "revision",
      "Character draft revision must be a whole number."
    );
  }

  return draft;
}

function requireExpectedRevision(
  draft,
  expectedRevision
) {
  if (!Number.isInteger(expectedRevision)) {
    throw createUpdateError(
      "invalid_expected_revision",
      "expectedRevision",
      "Expected revision must be a whole number."
    );
  }

  if (draft.revision !== expectedRevision) {
    throw createUpdateError(
      "stale_draft_revision",
      "revision",
      `Expected revision ${expectedRevision}, but the current revision is ${draft.revision}.`
    );
  }
}

function prepareUpdate(draft, expectedRevision) {
  requireDraft(draft);
  requireExpectedRevision(
    draft,
    expectedRevision
  );

  return {
    ...draft,
    identity: {
      ...draft.identity
    },
    attributes: {
      ...draft.attributes
    },
    skills: {
      ...draft.skills
    },
    professionChoices: {
      ...draft.professionChoices
    },
    completedStages: [
      ...(draft.completedStages ?? [])
    ],
    revision: draft.revision + 1
  };
}

function calculateTotal(values) {
  return Object.values(values).reduce(
    (total, value) => total + value,
    0
  );
}

function updateCharacterName({
  draft,
  expectedRevision,
  name
}) {
  if (
    typeof name !== "string" ||
    name.trim().length === 0
  ) {
    throw createUpdateError(
      "invalid_character_name",
      "identity.name",
      "Character name must be a non-empty string."
    );
  }

  const updatedDraft = prepareUpdate(
    draft,
    expectedRevision
  );

  updatedDraft.identity.name = name.trim();

  return updatedDraft;
}

function updateCharacterAttribute({
  draft,
  expectedRevision,
  attributeId,
  value
}) {
  if (!CORE_ATTRIBUTES.includes(attributeId)) {
    throw createUpdateError(
      "unknown_attribute",
      `attributes.${attributeId}`,
      `Unknown core attribute: ${attributeId}`
    );
  }

  if (!Number.isInteger(value)) {
    throw createUpdateError(
      "invalid_attribute_value",
      `attributes.${attributeId}`,
      "Attribute value must be a whole number."
    );
  }

  if (value < ATTRIBUTE_RULES.minimum) {
    throw createUpdateError(
      "attribute_below_minimum",
      `attributes.${attributeId}`,
      `${attributeId} cannot be lower than ${ATTRIBUTE_RULES.minimum}.`
    );
  }

  if (value > ATTRIBUTE_RULES.maximum) {
    throw createUpdateError(
      "attribute_above_maximum",
      `attributes.${attributeId}`,
      `${attributeId} cannot be higher than ${ATTRIBUTE_RULES.maximum}.`
    );
  }

  const updatedDraft = prepareUpdate(
    draft,
    expectedRevision
  );

  updatedDraft.attributes[attributeId] = value;

  if (
    calculateTotal(updatedDraft.attributes) >
    ATTRIBUTE_RULES.totalBudget
  ) {
    throw createUpdateError(
      "attribute_budget_exceeded",
      "attributes",
      "This change would exceed the attribute point budget."
    );
  }

  return updatedDraft;
}

function updateCharacterSkill({
  draft,
  expectedRevision,
  skillId,
  value
}) {
  const skill = getSkillDefinition(skillId);

  if (!skill) {
    throw createUpdateError(
      "unknown_skill",
      `skills.${skillId}`,
      `Unknown skill: ${skillId}`
    );
  }

  if (!Number.isInteger(value)) {
    throw createUpdateError(
      "invalid_skill_value",
      `skills.${skillId}`,
      `${skill.name} must be a whole number.`
    );
  }

  if (value < SKILL_CREATION_RULES.minimum) {
    throw createUpdateError(
      "skill_below_minimum",
      `skills.${skillId}`,
      `${skill.name} cannot be lower than ${SKILL_CREATION_RULES.minimum}.`
    );
  }

  if (value > SKILL_CREATION_RULES.maximum) {
    throw createUpdateError(
      "skill_above_creation_maximum",
      `skills.${skillId}`,
      `${skill.name} cannot be higher than ${SKILL_CREATION_RULES.maximum} during character creation.`
    );
  }

  const updatedDraft = prepareUpdate(
    draft,
    expectedRevision
  );

  updatedDraft.skills[skillId] = value;

  if (
    calculateTotal(updatedDraft.skills) >
    SKILL_CREATION_RULES.totalBudget
  ) {
    throw createUpdateError(
      "skill_budget_exceeded",
      "skills",
      "This change would exceed the skill point budget."
    );
  }

  return updatedDraft;
}

function updateCharacterProfession({
  draft,
  expectedRevision,
  professionId
}) {
  const profession =
    getProfessionDefinition(professionId);

  if (!profession) {
    throw createUpdateError(
      "unknown_profession",
      "profession",
      `Unknown profession: ${professionId}`
    );
  }

  const updatedDraft = prepareUpdate(
    draft,
    expectedRevision
  );

  updatedDraft.profession = profession.id;
  updatedDraft.professionChoices = {};

  return updatedDraft;
}

function validateProfessionChoice(
  profession,
  choice,
  value
) {
  if (
    typeof value !== "string" ||
    value.trim().length === 0
  ) {
    throw createUpdateError(
      "invalid_profession_choice",
      `professionChoices.${choice.id}`,
      `${profession.name} requires a valid ${choice.id} selection.`
    );
  }

  const normalisedValue = value.trim();

  if (
    choice.type === "weapon_type" &&
    !getWeaponTypeDefinition(normalisedValue)
  ) {
    throw createUpdateError(
      "unknown_weapon_type",
      `professionChoices.${choice.id}`,
      `Unknown weapon type: ${normalisedValue}`
    );
  }

  return normalisedValue;
}

function updateCharacterProfessionChoice({
  draft,
  expectedRevision,
  choiceId,
  value
}) {
  const currentDraft = requireDraft(draft);

  const profession = getProfessionDefinition(
    currentDraft.profession
  );

  if (!profession) {
    throw createUpdateError(
      "profession_required",
      "profession",
      "Select a profession before setting profession choices."
    );
  }

  const choice = profession.choices.find(
    (candidate) => candidate.id === choiceId
  );

  if (!choice) {
    throw createUpdateError(
      "unexpected_profession_choice",
      `professionChoices.${choiceId}`,
      `${profession.name} does not use the ${choiceId} choice.`
    );
  }

  const normalisedValue =
    validateProfessionChoice(
      profession,
      choice,
      value
    );

  const updatedDraft = prepareUpdate(
    currentDraft,
    expectedRevision
  );

  updatedDraft.professionChoices[choiceId] =
    normalisedValue;

  return updatedDraft;
}

module.exports = {
  CharacterDraftUpdateError,
  updateCharacterName,
  updateCharacterAttribute,
  updateCharacterSkill,
  updateCharacterProfession,
  updateCharacterProfessionChoice
};