"use strict";

const {
  CORE_ATTRIBUTES
} = require("./characterCreationDefinition");

const SKILL_DEFINITION_STATUS = Object.freeze({
  CONFIRMED: "confirmed",
  PROVISIONAL: "provisional"
});

const SKILL_CREATION_RULES = Object.freeze({
  minimum: 0,
  maximum: 4,
  totalBudget: 24,
  untrainedAllowed: true,
  untrainedRollMode: "disadvantage"
});

const SKILL_CATEGORIES = Object.freeze({
  COMBAT: "combat",
  RANGED_ATTACK: "ranged_attack",
  MELEE_ATTACK: "melee_attack",
  PHYSICAL: "physical",
  TECHNICAL: "technical",
  DIGITAL: "digital",
  SECURITY: "security",
  INVESTIGATION: "investigation",
  KNOWLEDGE: "knowledge",
  SOCIAL: "social",
  DEDUCTION: "deduction",
  MENTAL: "mental",
  VEHICLE_OPERATION: "vehicle_operation",
  VEHICLE_REPAIR: "vehicle_repair"
});

function createSkill({
  id,
  name,
  defaultAttribute,
  categories,
  alternateAttributes = [],
  status = SKILL_DEFINITION_STATUS.CONFIRMED,
  notes = null
}) {
  return {
    id,
    name,
    defaultAttribute,
    alternateAttributes,
    categories,
    status,
    notes
  };
}

const SKILL_DEFINITIONS = [
  createSkill({
    id: "firearms",
    name: "Firearms",
    defaultAttribute: "dexterity",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.RANGED_ATTACK
    ]
  }),
  createSkill({
    id: "melee",
    name: "Melee",
    defaultAttribute: "force",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.MELEE_ATTACK
    ]
  }),
  createSkill({
    id: "unarmed_combat",
    name: "Unarmed Combat",
    defaultAttribute: "force",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.MELEE_ATTACK
    ]
  }),
  createSkill({
    id: "grappling",
    name: "Grappling",
    defaultAttribute: "force",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.MELEE_ATTACK,
      SKILL_CATEGORIES.PHYSICAL
    ]
  }),
  createSkill({
    id: "evasion",
    name: "Evasion",
    defaultAttribute: "agility",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.PHYSICAL
    ]
  }),
  createSkill({
    id: "explosives",
    name: "Explosives",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.COMBAT,
      SKILL_CATEGORIES.TECHNICAL
    ],
    status: SKILL_DEFINITION_STATUS.PROVISIONAL,
    notes: "The governing attribute remains subject to review."
  }),

  createSkill({
    id: "athletics",
    name: "Athletics",
    defaultAttribute: "force",
    categories: [
      SKILL_CATEGORIES.PHYSICAL
    ]
  }),
  createSkill({
    id: "acrobatics",
    name: "Acrobatics",
    defaultAttribute: "agility",
    categories: [
      SKILL_CATEGORIES.PHYSICAL
    ]
  }),
  createSkill({
    id: "endurance",
    name: "Endurance",
    defaultAttribute: "force",
    categories: [
      SKILL_CATEGORIES.PHYSICAL
    ],
    notes: "Each skill point is currently intended to add one maximum HP."
  }),
  createSkill({
    id: "stealth",
    name: "Stealth",
    defaultAttribute: "agility",
    categories: [
      SKILL_CATEGORIES.PHYSICAL
    ]
  }),

  createSkill({
    id: "engineering",
    name: "Engineering",
    defaultAttribute: "dexterity",
    categories: [
      SKILL_CATEGORIES.TECHNICAL
    ]
  }),
  createSkill({
    id: "mechanical_security",
    name: "Mechanical Security",
    defaultAttribute: "dexterity",
    categories: [
      SKILL_CATEGORIES.TECHNICAL,
      SKILL_CATEGORIES.SECURITY
    ]
  }),
  createSkill({
    id: "medicine",
    name: "Medicine",
    defaultAttribute: "dexterity",
    categories: [
      SKILL_CATEGORIES.TECHNICAL
    ]
  }),
  createSkill({
    id: "computers",
    name: "Computers",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.TECHNICAL,
      SKILL_CATEGORIES.DIGITAL
    ]
  }),
  createSkill({
    id: "digital_security",
    name: "Digital Security",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.TECHNICAL,
      SKILL_CATEGORIES.DIGITAL,
      SKILL_CATEGORIES.SECURITY
    ]
  }),

  createSkill({
    id: "investigation",
    name: "Investigation",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.INVESTIGATION,
      SKILL_CATEGORIES.DEDUCTION
    ]
  }),
  createSkill({
    id: "knowledge",
    name: "Knowledge",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.KNOWLEDGE
    ]
  }),
  createSkill({
    id: "science",
    name: "Science",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.KNOWLEDGE,
      SKILL_CATEGORIES.TECHNICAL
    ]
  }),
  createSkill({
    id: "tactics",
    name: "Tactics",
    defaultAttribute: "intellect",
    categories: [
      SKILL_CATEGORIES.KNOWLEDGE
    ]
  }),
  createSkill({
    id: "perception",
    name: "Perception",
    defaultAttribute: "awareness",
    categories: [
      SKILL_CATEGORIES.INVESTIGATION
    ]
  }),
  createSkill({
    id: "tracking",
    name: "Tracking",
    defaultAttribute: "awareness",
    categories: [
      SKILL_CATEGORIES.INVESTIGATION
    ]
  }),
  createSkill({
    id: "streetwise",
    name: "Streetwise",
    defaultAttribute: "awareness",
    categories: [
      SKILL_CATEGORIES.INVESTIGATION,
      SKILL_CATEGORIES.KNOWLEDGE
    ]
  }),
  createSkill({
    id: "insight",
    name: "Insight",
    defaultAttribute: "awareness",
    categories: [
      SKILL_CATEGORIES.INVESTIGATION,
      SKILL_CATEGORIES.DEDUCTION
    ]
  }),

  createSkill({
    id: "persuasion",
    name: "Persuasion",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "deception",
    name: "Deception",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "negotiation",
    name: "Negotiation",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "leadership",
    name: "Leadership",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "performance",
    name: "Performance",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "networking",
    name: "Networking",
    defaultAttribute: "face",
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ]
  }),
  createSkill({
    id: "intimidation",
    name: "Intimidation",
    defaultAttribute: "face",
    alternateAttributes: [
      "force"
    ],
    categories: [
      SKILL_CATEGORIES.SOCIAL
    ],
    notes: "Force may govern physically based intimidation checks."
  }),

  createSkill({
    id: "discipline",
    name: "Discipline",
    defaultAttribute: "will",
    categories: [
      SKILL_CATEGORIES.MENTAL
    ]
  }),
  createSkill({
    id: "resolve",
    name: "Resolve",
    defaultAttribute: "will",
    categories: [
      SKILL_CATEGORIES.MENTAL
    ]
  }),
  createSkill({
    id: "survival",
    name: "Survival",
    defaultAttribute: "will",
    categories: [
      SKILL_CATEGORIES.MENTAL
    ],
    status: SKILL_DEFINITION_STATUS.PROVISIONAL,
    notes: "The exact scope and governing attribute remain subject to review."
  })
];

function validateSkillDefinitions(skillDefinitions) {
  if (!Array.isArray(skillDefinitions)) {
    throw new TypeError("Skill definitions must be an array.");
  }

  const knownAttributes = new Set(CORE_ATTRIBUTES);
  const knownCategories = new Set(Object.values(SKILL_CATEGORIES));
  const knownStatuses = new Set(
    Object.values(SKILL_DEFINITION_STATUS)
  );
  const usedIds = new Set();

  for (const skill of skillDefinitions) {
    if (!skill || typeof skill !== "object") {
      throw new TypeError("Each skill definition must be an object.");
    }

    if (typeof skill.id !== "string" || skill.id.length === 0) {
      throw new TypeError("Each skill definition requires an id.");
    }

    if (usedIds.has(skill.id)) {
      throw new Error(`Duplicate skill id: ${skill.id}`);
    }

    usedIds.add(skill.id);

    if (typeof skill.name !== "string" || skill.name.length === 0) {
      throw new TypeError(
        `Skill ${skill.id} requires a display name.`
      );
    }

    if (!knownAttributes.has(skill.defaultAttribute)) {
      throw new Error(
        `Skill ${skill.id} has an unknown default attribute.`
      );
    }

    if (!Array.isArray(skill.alternateAttributes)) {
      throw new TypeError(
        `Skill ${skill.id} alternate attributes must be an array.`
      );
    }

    for (const attributeId of skill.alternateAttributes) {
      if (!knownAttributes.has(attributeId)) {
        throw new Error(
          `Skill ${skill.id} has an unknown alternate attribute.`
        );
      }
    }

    if (
      !Array.isArray(skill.categories) ||
      skill.categories.length === 0
    ) {
      throw new Error(
        `Skill ${skill.id} requires at least one category.`
      );
    }

    for (const category of skill.categories) {
      if (!knownCategories.has(category)) {
        throw new Error(
          `Skill ${skill.id} has an unknown category: ${category}`
        );
      }
    }

    if (!knownStatuses.has(skill.status)) {
      throw new Error(
        `Skill ${skill.id} has an unknown definition status.`
      );
    }
  }

  return true;
}

validateSkillDefinitions(SKILL_DEFINITIONS);

for (const skill of SKILL_DEFINITIONS) {
  Object.freeze(skill.alternateAttributes);
  Object.freeze(skill.categories);
  Object.freeze(skill);
}

Object.freeze(SKILL_DEFINITIONS);

const SKILL_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    SKILL_DEFINITIONS.map((skill) => [
      skill.id,
      skill
    ])
  )
);

function getSkillDefinitions() {
  return SKILL_DEFINITIONS;
}

function getSkillDefinition(skillId) {
  return SKILL_DEFINITIONS_BY_ID[skillId] ?? null;
}

module.exports = {
  SKILL_DEFINITION_STATUS,
  SKILL_CREATION_RULES,
  SKILL_CATEGORIES,
  SKILL_DEFINITIONS,
  getSkillDefinitions,
  getSkillDefinition,
  validateSkillDefinitions
};