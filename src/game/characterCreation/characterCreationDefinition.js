"use strict";

const CORE_ATTRIBUTES = Object.freeze([
  "force",
  "agility",
  "dexterity",
  "intellect",
  "awareness",
  "will",
  "face"
]);

const ATTRIBUTE_RULES = Object.freeze({
  minimum: 2,
  maximum: 8,
  totalBudget: 42
});

const CHARACTER_CREATION_STAGES = Object.freeze([
  "identity",
  "attributes",
  "skills",
  "profession",
  "review"
]);

const CHARACTER_CREATION_DEFINITION = Object.freeze({
  version: 1,
  attributes: Object.freeze({
    ids: CORE_ATTRIBUTES,
    minimum: ATTRIBUTE_RULES.minimum,
    maximum: ATTRIBUTE_RULES.maximum,
    totalBudget: ATTRIBUTE_RULES.totalBudget
  }),
  stages: CHARACTER_CREATION_STAGES
});

function getCharacterCreationDefinition() {
  return CHARACTER_CREATION_DEFINITION;
}

module.exports = {
  CORE_ATTRIBUTES,
  ATTRIBUTE_RULES,
  CHARACTER_CREATION_STAGES,
  CHARACTER_CREATION_DEFINITION,
  getCharacterCreationDefinition
};