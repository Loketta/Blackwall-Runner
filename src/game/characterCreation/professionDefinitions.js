"use strict";

const {
  SKILL_CATEGORIES,
  getSkillDefinition
} = require("./skillDefinitions");

const PROFESSION_DEFINITION_STATUS = Object.freeze({
  CONFIRMED: "confirmed",
  PROVISIONAL: "provisional"
});

const APTITUDE_TARGET_TYPE = Object.freeze({
  SKILL: "skill",
  CATEGORY: "category",
  CHECK_CATEGORY: "check_category",
  CUSTOM: "custom"
});

const PROFESSION_CHOICE_TYPE = Object.freeze({
  WEAPON_TYPE: "weapon_type"
});

const PROFESSION_DEFINITIONS = [
  {
    id: "melee_specialist",
    name: "Melee Specialist",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "melee",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "unarmed_combat",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "grappling",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "endurance",
        bonusPerLevel: 2
      }
    ],
    choices: [],
    mastery: {
      id: "monstrous",
      name: "Monstrous",
      implementationTier: "easy",
      description:
        "The profession gains two Endurance aptitude points per level."
    }
  },
  {
    id: "ranged_specialist",
    name: "Ranged Specialist",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.CHECK_CATEGORY,
        targetId: SKILL_CATEGORIES.RANGED_ATTACK,
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "deadeye",
      name: "Deadeye",
      implementationTier: "easy",
      description:
        "The character may spend a full turn aiming. Their next ranged attack doubles the profession bonus applied to the attack roll. Moving, attacking or taking another significant action first ends the effect."
    }
  },
  {
    id: "operator",
    name: "Operator",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "stealth",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "explosives",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.CUSTOM,
        targetId: "selected_weapon_type",
        bonusPerLevel: 1
      }
    ],
    choices: [
      {
        id: "weapon_type",
        type: PROFESSION_CHOICE_TYPE.WEAPON_TYPE,
        required: true,
        minimumSelections: 1,
        maximumSelections: 1
      }
    ],
    mastery: {
      id: "ghost",
      name: "Ghost",
      implementationTier: "encounter_state",
      description:
        "An attack or grapple against an enemy unaware of the party automatically hits. A qualifying melee attack also deals double damage."
    }
  },
  {
    id: "engineer",
    name: "Engineer",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.CATEGORY,
        targetId: SKILL_CATEGORIES.TECHNICAL,
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "quartermaster",
      name: "Quartermaster",
      implementationTier: "easy",
      description:
        "The Engineer receives one weapon modification slot per profession level. A weapon may benefit from one Quartermaster modification."
    }
  },
  {
    id: "medic",
    name: "Medic",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "medicine",
        bonusPerLevel: 2
      }
    ],
    choices: [],
    mastery: {
      id: "combat_surgeon",
      name: "Combat Surgeon",
      implementationTier: "encounter_state",
      description:
        "Once per combat encounter, automatically revive one downed ally. Restored HP equals the ally's Endurance plus the Medic's Medicine."
    }
  },
  {
    id: "face",
    name: "Face",
    status: PROFESSION_DEFINITION_STATUS.PROVISIONAL,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.CATEGORY,
        targetId: SKILL_CATEGORIES.SOCIAL,
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.CHECK_CATEGORY,
        targetId: SKILL_CATEGORIES.DEDUCTION,
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "cutting_words",
      name: "Cutting Words",
      implementationTier: "encounter_state",
      description:
        "Once per encounter, roll Intimidation against applicable opponents' Resolve. Failed targets suffer minus one to attack rolls against the party for the remainder of the encounter."
    },
    notes:
      "The exact scope of the Deduction category remains subject to review."
  },
  {
    id: "driver",
    name: "Driver",
    status: PROFESSION_DEFINITION_STATUS.PROVISIONAL,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.CHECK_CATEGORY,
        targetId: SKILL_CATEGORIES.VEHICLE_OPERATION,
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.CHECK_CATEGORY,
        targetId: SKILL_CATEGORIES.VEHICLE_REPAIR,
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "gearhead",
      name: "Gearhead",
      implementationTier: "world_system",
      description:
        "The Driver may attempt to start or operate any vehicle without keys or authorisation, identifies observable vehicle damage and does not suffer penalties solely because a vehicle type is unfamiliar."
    },
    notes:
      "Vehicle skill structure remains unresolved."
  },
  {
    id: "investigator",
    name: "Investigator",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "investigation",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "tracking",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "streetwise",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "perception",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "insight",
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "keen_eye",
      name: "Keen Eye",
      implementationTier: "world_system",
      description:
        "Automatically makes passive Investigation and Perception checks when entering a location for the first time and when returning after meaningful changes."
    }
  },
  {
    id: "hacker",
    name: "Hacker",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "computers",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "digital_security",
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "hijack",
      name: "Hijack",
      implementationTier: "world_system",
      description:
        "After gaining access to a terminal or network access point, the Hacker may attempt to control connected devices."
    }
  },
  {
    id: "commander",
    name: "Commander",
    status: PROFESSION_DEFINITION_STATUS.CONFIRMED,
    aptitudes: [
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "tactics",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "leadership",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "negotiation",
        bonusPerLevel: 1
      },
      {
        targetType: APTITUDE_TARGET_TYPE.SKILL,
        targetId: "discipline",
        bonusPerLevel: 1
      }
    ],
    choices: [],
    mastery: {
      id: "focus_fire",
      name: "Focus Fire",
      implementationTier: "easy",
      description:
        "The Commander designates one Identified Target. Party members gain damage equal to Commander level and an attack bonus equal to half the Commander level rounded up."
    }
  }
];

function validateAptitude(profession, aptitude) {
  if (!aptitude || typeof aptitude !== "object") {
    throw new TypeError(
      `Profession ${profession.id} has an invalid aptitude.`
    );
  }

  if (
    !Object.values(APTITUDE_TARGET_TYPE).includes(
      aptitude.targetType
    )
  ) {
    throw new Error(
      `Profession ${profession.id} has an unknown aptitude target type.`
    );
  }

  if (
    typeof aptitude.targetId !== "string" ||
    aptitude.targetId.length === 0
  ) {
    throw new TypeError(
      `Profession ${profession.id} has an aptitude without a target id.`
    );
  }

  if (
    !Number.isInteger(aptitude.bonusPerLevel) ||
    aptitude.bonusPerLevel <= 0
  ) {
    throw new TypeError(
      `Profession ${profession.id} has an invalid aptitude bonus.`
    );
  }

  if (
    aptitude.targetType === APTITUDE_TARGET_TYPE.SKILL &&
    !getSkillDefinition(aptitude.targetId)
  ) {
    throw new Error(
      `Profession ${profession.id} references unknown skill ${aptitude.targetId}.`
    );
  }

  if (
    (
      aptitude.targetType === APTITUDE_TARGET_TYPE.CATEGORY ||
      aptitude.targetType === APTITUDE_TARGET_TYPE.CHECK_CATEGORY
    ) &&
    !Object.values(SKILL_CATEGORIES).includes(
      aptitude.targetId
    )
  ) {
    throw new Error(
      `Profession ${profession.id} references unknown category ${aptitude.targetId}.`
    );
  }
}

function validateProfessionDefinitions(professionDefinitions) {
  if (!Array.isArray(professionDefinitions)) {
    throw new TypeError("Profession definitions must be an array.");
  }

  const ids = new Set();
  const masteryIds = new Set();

  for (const profession of professionDefinitions) {
    if (!profession || typeof profession !== "object") {
      throw new TypeError(
        "Each profession definition must be an object."
      );
    }

    if (
      typeof profession.id !== "string" ||
      profession.id.length === 0
    ) {
      throw new TypeError(
        "Each profession definition requires an id."
      );
    }

    if (ids.has(profession.id)) {
      throw new Error(
        `Duplicate profession id: ${profession.id}`
      );
    }

    ids.add(profession.id);

    if (
      typeof profession.name !== "string" ||
      profession.name.length === 0
    ) {
      throw new TypeError(
        `Profession ${profession.id} requires a display name.`
      );
    }

    if (
      !Object.values(PROFESSION_DEFINITION_STATUS).includes(
        profession.status
      )
    ) {
      throw new Error(
        `Profession ${profession.id} has an unknown status.`
      );
    }

    if (
      !Array.isArray(profession.aptitudes) ||
      profession.aptitudes.length === 0
    ) {
      throw new Error(
        `Profession ${profession.id} requires at least one aptitude.`
      );
    }

    for (const aptitude of profession.aptitudes) {
      validateAptitude(profession, aptitude);
    }

    if (!Array.isArray(profession.choices)) {
      throw new TypeError(
        `Profession ${profession.id} choices must be an array.`
      );
    }

    for (const choice of profession.choices) {
      if (
        !choice ||
        typeof choice.id !== "string" ||
        choice.id.length === 0
      ) {
        throw new TypeError(
          `Profession ${profession.id} has an invalid choice.`
        );
      }

      if (
        !Object.values(PROFESSION_CHOICE_TYPE).includes(
          choice.type
        )
      ) {
        throw new Error(
          `Profession ${profession.id} has an unknown choice type.`
        );
      }

      if (
        !Number.isInteger(choice.minimumSelections) ||
        !Number.isInteger(choice.maximumSelections) ||
        choice.minimumSelections < 0 ||
        choice.maximumSelections < choice.minimumSelections
      ) {
        throw new Error(
          `Profession ${profession.id} has invalid choice limits.`
        );
      }
    }

    if (
      !profession.mastery ||
      typeof profession.mastery !== "object"
    ) {
      throw new TypeError(
        `Profession ${profession.id} requires a mastery.`
      );
    }

    if (
      typeof profession.mastery.id !== "string" ||
      profession.mastery.id.length === 0
    ) {
      throw new TypeError(
        `Profession ${profession.id} mastery requires an id.`
      );
    }

    if (masteryIds.has(profession.mastery.id)) {
      throw new Error(
        `Duplicate mastery id: ${profession.mastery.id}`
      );
    }

    masteryIds.add(profession.mastery.id);
  }

  return true;
}

validateProfessionDefinitions(PROFESSION_DEFINITIONS);

for (const profession of PROFESSION_DEFINITIONS) {
  for (const aptitude of profession.aptitudes) {
    Object.freeze(aptitude);
  }

  for (const choice of profession.choices) {
    Object.freeze(choice);
  }

  Object.freeze(profession.aptitudes);
  Object.freeze(profession.choices);
  Object.freeze(profession.mastery);
  Object.freeze(profession);
}

Object.freeze(PROFESSION_DEFINITIONS);

const PROFESSION_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    PROFESSION_DEFINITIONS.map((profession) => [
      profession.id,
      profession
    ])
  )
);

function getProfessionDefinitions() {
  return PROFESSION_DEFINITIONS;
}

function getProfessionDefinition(professionId) {
  return PROFESSION_DEFINITIONS_BY_ID[professionId] ?? null;
}

module.exports = {
  PROFESSION_DEFINITION_STATUS,
  APTITUDE_TARGET_TYPE,
  PROFESSION_CHOICE_TYPE,
  PROFESSION_DEFINITIONS,
  getProfessionDefinitions,
  getProfessionDefinition,
  validateProfessionDefinitions
};