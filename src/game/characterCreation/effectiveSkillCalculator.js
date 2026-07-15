"use strict";

const {
  getSkillDefinition
} = require("./skillDefinitions");

const {
  calculateProfessionBonus
} = require("./professionBonusCalculator");

function calculateEffectiveSkill({
  skillId,
  baseRank,
  professionId = null,
  professionLevel = 0,
  professionChoices = {},
  checkCategories = [],
  weaponType = null,
  equipmentBonus = 0,
  temporaryModifiers = 0
}) {
  if (!getSkillDefinition(skillId)) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  if (!Number.isInteger(baseRank) || baseRank < 0) {
    throw new TypeError(
      "baseRank must be a non-negative whole number."
    );
  }

  if (!Number.isInteger(equipmentBonus)) {
    throw new TypeError(
      "equipmentBonus must be a whole number."
    );
  }

  if (!Number.isInteger(temporaryModifiers)) {
    throw new TypeError(
      "temporaryModifiers must be a whole number."
    );
  }

  const professionBonus =
    calculateProfessionBonus({
      professionId,
      professionLevel,
      skillId,
      professionChoices,
      checkCategories,
      weaponType
    });

  return {
    skillId,
    baseRank,
    professionBonus,
    equipmentBonus,
    temporaryModifiers,
    effectiveRank:
      baseRank +
      professionBonus +
      equipmentBonus +
      temporaryModifiers
  };
}

function calculateDraftEffectiveSkill({
  draft,
  skillId,
  professionLevel = 1,
  checkCategories = [],
  weaponType = null,
  equipmentBonus = 0,
  temporaryModifiers = 0
}) {
  if (!draft || typeof draft !== "object") {
    throw new TypeError("draft must be an object.");
  }

  if (
    !draft.skills ||
    typeof draft.skills !== "object"
  ) {
    throw new TypeError(
      "draft must contain skill ranks."
    );
  }

  return calculateEffectiveSkill({
    skillId,
    baseRank: draft.skills[skillId],
    professionId: draft.profession,
    professionLevel,
    professionChoices:
      draft.professionChoices ?? {},
    checkCategories,
    weaponType,
    equipmentBonus,
    temporaryModifiers
  });
}

module.exports = {
  calculateEffectiveSkill,
  calculateDraftEffectiveSkill
};