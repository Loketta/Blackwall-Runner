"use strict";

const {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES
} = require("./characterCreationDefinition");

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

function validateCharacterDraft(draft) {
  const errors = [];

  if (!validateDraftShape(draft, errors)) {
    return {
      valid: false,
      errors
    };
  }

  validateAttributes(draft.attributes, errors);

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateCharacterDraft
};