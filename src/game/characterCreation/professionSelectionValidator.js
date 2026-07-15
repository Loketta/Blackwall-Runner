"use strict";

const {
  PROFESSION_CHOICE_TYPE,
  getProfessionDefinition
} = require("./professionDefinitions");

const {
  getWeaponTypeDefinition
} = require("./weaponTypeDefinitions");

function createError(field, code, message) {
  return {
    field,
    code,
    message
  };
}

function isNonEmptyString(value) {
  return (
    typeof value === "string" &&
    value.trim().length > 0
  );
}

function validateWeaponTypeChoice(
  profession,
  choice,
  value,
  errors
) {
  if (!isNonEmptyString(value)) {
    return;
  }

  const normalisedValue = value.trim();

  if (!getWeaponTypeDefinition(normalisedValue)) {
    errors.push(
      createError(
        `professionChoices.${choice.id}`,
        "unknown_weapon_type",
        `Unknown weapon type: ${normalisedValue}`
      )
    );
  }
}

function validateChoiceValue(
  profession,
  choice,
  value,
  errors
) {
  if (
    choice.type === PROFESSION_CHOICE_TYPE.WEAPON_TYPE
  ) {
    validateWeaponTypeChoice(
      profession,
      choice,
      value,
      errors
    );
  }
}

function validateProfessionSelection(
  professionId,
  professionChoices
) {
  const errors = [];

  if (!isNonEmptyString(professionId)) {
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

  const normalisedProfessionId = professionId.trim();

  const profession = getProfessionDefinition(
    normalisedProfessionId
  );

  if (!profession) {
    errors.push(
      createError(
        "profession",
        "unknown_profession",
        `Unknown profession: ${normalisedProfessionId}`
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
      !isNonEmptyString(value)
    ) {
      errors.push(
        createError(
          `professionChoices.${choice.id}`,
          "required_profession_choice",
          `${profession.name} requires a ${choice.id} selection.`
        )
      );

      continue;
    }

    validateChoiceValue(
      profession,
      choice,
      value,
      errors
    );
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  validateProfessionSelection
};