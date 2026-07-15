"use strict";

const {
  CHECK_ROLL_MODE
} = require("./checkRollProfile");

function defaultRollDie(sides) {
  return Math.floor(Math.random() * sides) + 1;
}

function validateDiceProfile(dice) {
  if (!dice || typeof dice !== "object") {
    throw new TypeError(
      "Check profile must contain dice instructions."
    );
  }

  if (!Number.isInteger(dice.count) || dice.count <= 0) {
    throw new TypeError(
      "Dice count must be a positive whole number."
    );
  }

  if (!Number.isInteger(dice.sides) || dice.sides <= 1) {
    throw new TypeError(
      "Dice sides must be a whole number greater than one."
    );
  }

  if (
    dice.keep !== "only" &&
    dice.keep !== "lower"
  ) {
    throw new Error(
      `Unsupported dice keep rule: ${dice.keep}`
    );
  }
}

function validateCheckProfile(profile) {
  if (!profile || typeof profile !== "object") {
    throw new TypeError(
      "Check profile must be an object."
    );
  }

  if (
    profile.rollMode !== CHECK_ROLL_MODE.STANDARD &&
    profile.rollMode !== CHECK_ROLL_MODE.DISADVANTAGE
  ) {
    throw new Error(
      `Unsupported check roll mode: ${profile.rollMode}`
    );
  }

  if (!Number.isInteger(profile.staticModifier)) {
    throw new TypeError(
      "Check profile staticModifier must be a whole number."
    );
  }

  validateDiceProfile(profile.dice);

  if (
    profile.rollMode === CHECK_ROLL_MODE.STANDARD &&
    (
      profile.dice.count !== 1 ||
      profile.dice.keep !== "only"
    )
  ) {
    throw new Error(
      "Standard checks must roll one die and keep it."
    );
  }

  if (
    profile.rollMode === CHECK_ROLL_MODE.DISADVANTAGE &&
    (
      profile.dice.count !== 2 ||
      profile.dice.keep !== "lower"
    )
  ) {
    throw new Error(
      "Disadvantage checks must roll two dice and keep the lower result."
    );
  }

  return true;
}

function rollDice(dice, rollDie) {
  const results = [];

  for (let index = 0; index < dice.count; index += 1) {
    const result = rollDie(dice.sides);

    if (
      !Number.isInteger(result) ||
      result < 1 ||
      result > dice.sides
    ) {
      throw new Error(
        `Die result must be between 1 and ${dice.sides}.`
      );
    }

    results.push(result);
  }

  return results;
}

function selectKeptDie(diceRolled, keepRule) {
  if (keepRule === "only") {
    return diceRolled[0];
  }

  if (keepRule === "lower") {
    return Math.min(...diceRolled);
  }

  throw new Error(
    `Unsupported dice keep rule: ${keepRule}`
  );
}

function resolveCheckRoll({
  profile,
  rollDie = defaultRollDie
}) {
  validateCheckProfile(profile);

  if (typeof rollDie !== "function") {
    throw new TypeError("rollDie must be a function.");
  }

  const diceRolled = rollDice(
    profile.dice,
    rollDie
  );

  const keptDie = selectKeptDie(
    diceRolled,
    profile.dice.keep
  );

  const discardedDice = diceRolled.filter(
    (result, index) =>
      result !== keptDie ||
      index !== diceRolled.indexOf(keptDie)
  );

  return {
    skillId: profile.skillId ?? null,
    attributeId: profile.attributeId ?? null,
    trained: profile.trained,
    rollMode: profile.rollMode,
    diceRolled,
    keptDie,
    discardedDice,
    staticModifier: profile.staticModifier,
    total: keptDie + profile.staticModifier
  };
}

module.exports = {
  defaultRollDie,
  validateCheckProfile,
  resolveCheckRoll
};