"use strict";

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES
} = require("./characterCreationDefinition");

const {
  SKILL_DEFINITIONS,
  SKILL_CREATION_RULES
} = require("./skillDefinitions");

const {
  validateProfessionSelection
} = require("./professionSelectionValidator");

function createError(field, code, message) {
  return {
    field,
    code,
    message
  };
}

function validateDraftShape(draft, errors) {
  if (!draft || typeof draft !== "object" || Array.isArray(draft)) {
    errors.push(
      createError(
        "draft",
        "invalid_draft",
        "Character draft must be an object."
      )
    );

    return false;
  }

  return true;
}

function validateAttributes(attributes, errors) {
  if (
    !attributes ||
    typeof attributes !== "object" ||
    Array.isArray(attributes)
  ) {
    errors.push(
      createError(
        "attributes",
        "missing_attributes",
        "Core attributes are required."
      )
    );

    return;
  }

  let total = 0;
  let canCalculateTotal = true;

  for (const attributeId of CORE_ATTRIBUTES) {
    const value = attributes[attributeId];
    const field = `attributes.${attributeId}`;

    if (!Number.isInteger(value)) {
      errors.push(
        createError(
          field,
          "invalid_attribute_value",
          `${attributeId} must be a whole number.`
        )
      );

      canCalculateTotal = false;
      continue;
    }

    total += value;

    if (value < ATTRIBUTE_RULES.minimum) {
      errors.push(
        createError(
          field,
          "attribute_below_minimum",
          `${attributeId} cannot be lower than ${ATTRIBUTE_RULES.minimum}.`
        )
      );
    }

    if (value > ATTRIBUTE_RULES.maximum) {
      errors.push(
        createError(
          field,
          "attribute_above_maximum",
          `${attributeId} cannot be higher than ${ATTRIBUTE_RULES.maximum}.`
        )
      );
    }
  }

  if (!canCalculateTotal) {
    return;
  }

  if (total < ATTRIBUTE_RULES.totalBudget) {
    errors.push(
      createError(
        "attributes",
        "unspent_attribute_points",
        `You have ${
          ATTRIBUTE_RULES.totalBudget - total
        } attribute points remaining.`
      )
    );
  }

  if (total > ATTRIBUTE_RULES.totalBudget) {
    errors.push(
      createError(
        "attributes",
        "attribute_budget_exceeded",
        `You have spent ${
          total - ATTRIBUTE_RULES.totalBudget
        } too many attribute points.`
      )
    );
  }
}

function validateSkills(skills, errors) {
  if (
    !skills ||
    typeof skills !== "object" ||
    Array.isArray(skills)
  ) {
    errors.push(
      createError(
        "skills",
        "missing_skills",
        "Skills are required."
      )
    );

    return;
  }

  let total = 0;
  let canCalculateTotal = true;

  for (const skill of SKILL_DEFINITIONS) {
    const value = skills[skill.id];
    const field = `skills.${skill.id}`;

    if (!Number.isInteger(value)) {
      errors.push(
        createError(
          field,
          "invalid_skill_value",
          `${skill.name} must be a whole number.`
        )
      );

      canCalculateTotal = false;
      continue;
    }

    total += value;

    if (value < SKILL_CREATION_RULES.minimum) {
      errors.push(
        createError(
          field,
          "skill_below_minimum",
          `${skill.name} cannot be lower than ${
            SKILL_CREATION_RULES.minimum
          } during character creation.`
        )
      );
    }

    if (value > SKILL_CREATION_RULES.maximum) {
      errors.push(
        createError(
          field,
          "skill_above_creation_maximum",
          `${skill.name} cannot be higher than ${
            SKILL_CREATION_RULES.maximum
          } during character creation.`
        )
      );
    }
  }

  if (!canCalculateTotal) {
    return;
  }

  if (total < SKILL_CREATION_RULES.totalBudget) {
    errors.push(
      createError(
        "skills",
        "unspent_skill_points",
        `You have ${
          SKILL_CREATION_RULES.totalBudget - total
        } skill points remaining.`
      )
    );
  }

  if (total > SKILL_CREATION_RULES.totalBudget) {
    errors.push(
      createError(
        "skills",
        "skill_budget_exceeded",
        `You have spent ${
          total - SKILL_CREATION_RULES.totalBudget
        } too many skill points.`
      )
    );
  }
}

function validateCharacterDraft(draft) {
  const errors = [];

  if (!validateDraftShape(draft, errors)) {
    return {
      valid: false,
      errors
    };
  }

  validateAttributes(draft.attributes, errors);
  validateSkills(draft.skills, errors);

  const professionResult = validateProfessionSelection(
    draft.profession,
    draft.professionChoices
  );

  errors.push(...professionResult.errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCharacterDraft
};