"use strict";

const {
  APTITUDE_TARGET_TYPE,
  getProfessionDefinition
} = require("./professionDefinitions");

const {
  getSkillDefinition
} = require("./skillDefinitions");

function requireNonNegativeInteger(value, fieldName) {
  if (!Number.isInteger(value) || value < 0) {
    throw new TypeError(
      `${fieldName} must be a non-negative whole number.`
    );
  }

  return value;
}

function normaliseStringArray(value, fieldName) {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new TypeError(`${fieldName} must be an array.`);
  }

  for (const entry of value) {
    if (
      typeof entry !== "string" ||
      entry.trim().length === 0
    ) {
      throw new TypeError(
        `${fieldName} must contain non-empty strings.`
      );
    }
  }

  return value.map((entry) => entry.trim());
}

function matchesSkillAptitude(aptitude, skill) {
  return aptitude.targetId === skill.id;
}

function matchesCategoryAptitude(aptitude, skill) {
  return skill.categories.includes(aptitude.targetId);
}

function matchesCheckCategoryAptitude(
  aptitude,
  skill,
  checkCategories
) {
  return (
    skill.categories.includes(aptitude.targetId) ||
    checkCategories.includes(aptitude.targetId)
  );
}

function matchesCustomAptitude(
  aptitude,
  professionChoices,
  weaponType
) {
  if (aptitude.targetId !== "selected_weapon_type") {
    return false;
  }

  if (
    typeof weaponType !== "string" ||
    weaponType.trim().length === 0
  ) {
    return false;
  }

  return (
    professionChoices.weapon_type ===
    weaponType.trim()
  );
}

function aptitudeApplies({
  aptitude,
  skill,
  checkCategories,
  professionChoices,
  weaponType
}) {
  switch (aptitude.targetType) {
    case APTITUDE_TARGET_TYPE.SKILL:
      return matchesSkillAptitude(aptitude, skill);

    case APTITUDE_TARGET_TYPE.CATEGORY:
      return matchesCategoryAptitude(
        aptitude,
        skill
      );

    case APTITUDE_TARGET_TYPE.CHECK_CATEGORY:
      return matchesCheckCategoryAptitude(
        aptitude,
        skill,
        checkCategories
      );

    case APTITUDE_TARGET_TYPE.CUSTOM:
      return matchesCustomAptitude(
        aptitude,
        professionChoices,
        weaponType
      );

    default:
      return false;
  }
}

function calculateProfessionBonus({
  professionId,
  professionLevel,
  skillId,
  professionChoices = {},
  checkCategories = [],
  weaponType = null
}) {
  requireNonNegativeInteger(
    professionLevel,
    "professionLevel"
  );

  const skill = getSkillDefinition(skillId);

  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  if (
    typeof professionId !== "string" ||
    professionId.trim().length === 0 ||
    professionLevel === 0
  ) {
    return 0;
  }

  const profession = getProfessionDefinition(
    professionId.trim()
  );

  if (!profession) {
    throw new Error(
      `Unknown profession: ${professionId}`
    );
  }

  if (
    !professionChoices ||
    typeof professionChoices !== "object" ||
    Array.isArray(professionChoices)
  ) {
    throw new TypeError(
      "professionChoices must be an object."
    );
  }

  const normalisedCheckCategories =
    normaliseStringArray(
      checkCategories,
      "checkCategories"
    );

  return profession.aptitudes.reduce(
    (total, aptitude) => {
      if (
        !aptitudeApplies({
          aptitude,
          skill,
          checkCategories:
            normalisedCheckCategories,
          professionChoices,
          weaponType
        })
      ) {
        return total;
      }

      return (
        total +
        aptitude.bonusPerLevel * professionLevel
      );
    },
    0
  );
}

module.exports = {
  calculateProfessionBonus
};