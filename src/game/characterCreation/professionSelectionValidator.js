"use strict";

const {
  getProfessionDefinition
} = require("./professionDefinitions");

function createError(field, code, message) {
  return {
    field,
    code,
    message
  };
}

function validateProfessionSelection(
  professionId,
  professionChoices
) {
  const errors = [];

  if (
    typeof professionId !== "string" ||
    professionId.trim().length === 0
  ) {
    errors.push(
      createError(
        "profession",
        "profession_required",
        "A profession must be selected."
      )
    );

    return {
      valid: false,
      errors
    };
  }

  const profession = getProfessionDefinition(
    professionId.trim()
  );

  if (!profession) {
    errors.push(
      createError(
        "profession",
        "unknown_profession",
        `Unknown profession: ${professionId}`
      )
    );

    return {
      valid: false,
      errors
    };
  }

  if (
    !professionChoices ||
    typeof professionChoices !== "object" ||
    Array.isArray(professionChoices)
  ) {
    errors.push(
      createError(
        "professionChoices",
        "invalid_profession_choices",
        "Profession choices must be an object."
      )
    );

    return {
      valid: false,
      errors
    };
  }

  const allowedChoiceIds = new Set(
    profession.choices.map((choice) => choice.id)
  );

  for (const suppliedChoiceId of Object.keys(
    professionChoices
  )) {
    if (!allowedChoiceIds.has(suppliedChoiceId)) {
      errors.push(
        createError(
          `professionChoices.${suppliedChoiceId}`,
          "unexpected_profession_choice",
          `${profession.name} does not use the ${suppliedChoiceId} choice.`
        )
      );
    }
  }

  for (const choice of profession.choices) {
    const value = professionChoices[choice.id];

    if (
      choice.required &&
      (
        typeof value !== "string" ||
        value.trim().length === 0
      )
    ) {
      errors.push(
        createError(
          `professionChoices.${choice.id}`,
          "required_profession_choice",
          `${profession.name} requires a ${choice.id} selection.`
        )
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateProfessionSelection
};