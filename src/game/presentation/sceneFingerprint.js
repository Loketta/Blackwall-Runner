"use strict";

const crypto = require("crypto");

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

function normaliseRequiredString(value, fieldName) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }

  return value.trim();
}

function compareCanonicalValues(left, right) {
  const leftValue = JSON.stringify(left);
  const rightValue = JSON.stringify(right);

  return leftValue.localeCompare(rightValue);
}

function canonicalise(value) {
  if (Array.isArray(value)) {
    return value
      .map(canonicalise)
      .sort(compareCanonicalValues);
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const canonicalObject = {};

    for (
      const key of Object.keys(value).sort()
    ) {
      canonicalObject[key] =
        canonicalise(value[key]);
    }

    return canonicalObject;
  }

  return value;
}

function createSceneContract(
  narrativeContext,
  promptVersion
) {
  return {
    promptVersion,
    weather:
      narrativeContext.world.weather ?? null,
    location: narrativeContext.location,
    visibleCharacters:
      narrativeContext.visibleCharacters ?? [],
    visibleItems:
      narrativeContext.visibleItems ?? [],
    visibleObjects:
      narrativeContext.visibleObjects ?? [],
    visibleShops:
      narrativeContext.visibleShops ?? []
  };
}

function createHash(sceneContract) {
  const serialisedScene = JSON.stringify(
    canonicalise(sceneContract)
  );

  return crypto
    .createHash("sha256")
    .update(serialisedScene, "utf8")
    .digest("hex");
}

class SceneFingerprint {
  constructor({
    narrativeContext,
    promptVersion
  }) {
    requireObject(
      narrativeContext,
      "narrativeContext"
    );
    requireObject(
      narrativeContext.world,
      "narrativeContext.world"
    );
    requireObject(
      narrativeContext.location,
      "narrativeContext.location"
    );

    const normalisedPromptVersion =
      normaliseRequiredString(
        promptVersion,
        "promptVersion"
      );

    const sceneContract =
      createSceneContract(
        narrativeContext,
        normalisedPromptVersion
      );

    this.value = createHash(sceneContract);
    this.promptVersion =
      normalisedPromptVersion;

    Object.freeze(this);
  }
}

module.exports = {
  SceneFingerprint
};
