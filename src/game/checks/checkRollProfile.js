"use strict";

const {
  CORE_ATTRIBUTES
} = require("../characterCreation/characterCreationDefinition");

const {
  getSkillDefinition
} = require("../characterCreation/skillDefinitions");

const {
  calculateEffectiveSkill,
  calculateDraftEffectiveSkill
} = require("../characterCreation/effectiveSkillCalculator");

const CHECK_ROLL_MODE = Object.freeze({
  STANDARD: "standard",
  DISADVANTAGE: "disadvantage"
});

function requireAttributeId(attributeId) {
  if (!CORE_ATTRIBUTES.includes(attributeId)) {
    throw new Error(
      `Unknown core attribute: ${attributeId}`
    );
  }

  return attributeId;
}

function requireAttributeValue(attributeValue) {
  if (
    !Number.isInteger(attributeValue) ||
    attributeValue < 0
  ) {
    throw new TypeError(
      "attributeValue must be a non-negative whole number."
    );
  }

  return attributeValue;
}

function isSkillTrained(skillResult) {
  return (
    skillResult.baseRank > 0 ||
    skillResult.professionBonus > 0
  );
}

function createDiceProfile(trained) {
  if (trained) {
    return {
      count: 1,
      sides: 10,
      keep: "only"
    };
  }

  return {
    count: 2,
    sides: 10,
    keep: "lower"
  };
}

function buildCheckRollProfile({
  attributeId,
  attributeValue,
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
  requireAttributeId(attributeId);
  requireAttributeValue(attributeValue);

  const skill = getSkillDefinition(skillId);

  if (!skill) {
    throw new Error(`Unknown skill: ${skillId}`);
  }

  const skillResult = calculateEffectiveSkill({
    skillId,
    baseRank,
    professionId,
    professionLevel,
    professionChoices,
    checkCategories,
    weaponType,
    equipmentBonus,
    temporaryModifiers
  });

  const trained = isSkillTrained(skillResult);

  return {
    attributeId,
    attributeValue,
    skillId,
    skillName: skill.name,
    trained,
    rollMode: trained
      ? CHECK_ROLL_MODE.STANDARD
      : CHECK_ROLL_MODE.DISADVANTAGE,
    dice: createDiceProfile(trained),
    baseRank: skillResult.baseRank,
    professionBonus: skillResult.professionBonus,
    equipmentBonus: skillResult.equipmentBonus,
    temporaryModifiers:
      skillResult.temporaryModifiers,
    effectiveSkill: skillResult.effectiveRank,
    staticModifier:
      attributeValue + skillResult.effectiveRank
  };
}

function buildDraftCheckRollProfile({
  draft,
  attributeId,
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
    !draft.attributes ||
    typeof draft.attributes !== "object"
  ) {
    throw new TypeError(
      "draft must contain core attributes."
    );
  }

  const skillResult = calculateDraftEffectiveSkill({
    draft,
    skillId,
    professionLevel,
    checkCategories,
    weaponType,
    equipmentBonus,
    temporaryModifiers
  });

  return buildCheckRollProfile({
    attributeId,
    attributeValue: draft.attributes[attributeId],
    skillId,
    baseRank: skillResult.baseRank,
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
  CHECK_ROLL_MODE,
  buildCheckRollProfile,
  buildDraftCheckRollProfile
};