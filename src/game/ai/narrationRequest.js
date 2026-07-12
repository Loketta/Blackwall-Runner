"use strict";

function cloneAndFreeze(value) {
  if (Array.isArray(value)) {
    return Object.freeze(
      value.map(cloneAndFreeze)
    );
  }

  if (value !== null && typeof value === "object") {
    const clone = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      clone[key] = cloneAndFreeze(nestedValue);
    }

    return Object.freeze(clone);
  }

  return value;
}

function requireNonEmptyString(value, fieldName) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }
}

function requireObject(value, fieldName) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new TypeError(
      `${fieldName} must be an object.`
    );
  }
}

class NarrationRequest {
  constructor({
    playerInput,
    narrativeContext,
    mode = "narrate_action",
    instructions = {}
  }) {
    requireNonEmptyString(
      playerInput,
      "playerInput"
    );
    requireNonEmptyString(
      mode,
      "mode"
    );
    requireObject(
      narrativeContext,
      "narrativeContext"
    );
    requireObject(
      instructions,
      "instructions"
    );

    this.playerInput = playerInput;
    this.mode = mode;
    this.narrativeContext =
      cloneAndFreeze(narrativeContext);
    this.instructions =
      cloneAndFreeze(instructions);

    Object.freeze(this);
  }
}

module.exports = {
  NarrationRequest
};
