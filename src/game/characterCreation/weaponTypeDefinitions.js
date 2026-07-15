"use strict";

const WEAPON_TYPE_CATEGORY = Object.freeze({
  RANGED: "ranged",
  MELEE: "melee"
});

const WEAPON_TYPE_DEFINITIONS = [
  {
    id: "pistols",
    name: "Pistols",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "submachine_guns",
    name: "Submachine Guns",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "shotguns",
    name: "Shotguns",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "assault_rifles",
    name: "Assault Rifles",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "sniper_rifles",
    name: "Sniper Rifles",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "heavy_weapons",
    name: "Heavy Weapons",
    category: WEAPON_TYPE_CATEGORY.RANGED
  },
  {
    id: "blades",
    name: "Blades",
    category: WEAPON_TYPE_CATEGORY.MELEE
  },
  {
    id: "blunt_weapons",
    name: "Blunt Weapons",
    category: WEAPON_TYPE_CATEGORY.MELEE
  }
];

function validateWeaponTypeDefinitions(
  weaponTypeDefinitions
) {
  if (!Array.isArray(weaponTypeDefinitions)) {
    throw new TypeError(
      "Weapon type definitions must be an array."
    );
  }

  const knownCategories = new Set(
    Object.values(WEAPON_TYPE_CATEGORY)
  );

  const usedIds = new Set();

  for (const weaponType of weaponTypeDefinitions) {
    if (!weaponType || typeof weaponType !== "object") {
      throw new TypeError(
        "Each weapon type definition must be an object."
      );
    }

    if (
      typeof weaponType.id !== "string" ||
      weaponType.id.length === 0
    ) {
      throw new TypeError(
        "Each weapon type definition requires an id."
      );
    }

    if (usedIds.has(weaponType.id)) {
      throw new Error(
        `Duplicate weapon type id: ${weaponType.id}`
      );
    }

    usedIds.add(weaponType.id);

    if (
      typeof weaponType.name !== "string" ||
      weaponType.name.length === 0
    ) {
      throw new TypeError(
        `Weapon type ${weaponType.id} requires a display name.`
      );
    }

    if (!knownCategories.has(weaponType.category)) {
      throw new Error(
        `Weapon type ${weaponType.id} has an unknown category.`
      );
    }
  }

  return true;
}

validateWeaponTypeDefinitions(
  WEAPON_TYPE_DEFINITIONS
);

for (const weaponType of WEAPON_TYPE_DEFINITIONS) {
  Object.freeze(weaponType);
}

Object.freeze(WEAPON_TYPE_DEFINITIONS);

const WEAPON_TYPE_DEFINITIONS_BY_ID = Object.freeze(
  Object.fromEntries(
    WEAPON_TYPE_DEFINITIONS.map((weaponType) => [
      weaponType.id,
      weaponType
    ])
  )
);

function getWeaponTypeDefinitions() {
  return WEAPON_TYPE_DEFINITIONS;
}

function getWeaponTypeDefinition(weaponTypeId) {
  return (
    WEAPON_TYPE_DEFINITIONS_BY_ID[weaponTypeId] ??
    null
  );
}

module.exports = {
  WEAPON_TYPE_CATEGORY,
  WEAPON_TYPE_DEFINITIONS,
  getWeaponTypeDefinitions,
  getWeaponTypeDefinition,
  validateWeaponTypeDefinitions
};