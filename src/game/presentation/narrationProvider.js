"use strict";

const {
  NarrationRequest
} = require("../ai/narrationRequest");
const {
  NarrationSnapshot
} = require("./narrationSnapshot");
const {
  SceneFingerprint
} = require("./sceneFingerprint");

const CACHEABLE_MODES = new Set([
  "describe_location"
]);

function requireService(
  value,
  methodNames,
  fieldName
) {
  if (!value) {
    throw new TypeError(
      `${fieldName} must provide ${methodNames.join(
        " and "
      )} functions.`
    );
  }

  for (const methodName of methodNames) {
    if (typeof value[methodName] !== "function") {
      throw new TypeError(
        `${fieldName} must provide ${methodNames.join(
          " and "
        )} functions.`
      );
    }
  }
}

function normaliseRequiredString(
  value,
  fieldName
) {
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

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }
}

function validateNarrationResult(result) {
  if (
    !result ||
    typeof result !== "object" ||
    Array.isArray(result)
  ) {
    throw new TypeError(
      "narrator result must be an object."
    );
  }

  normaliseRequiredString(
    result.narration,
    "narrator result narration"
  );

  normaliseRequiredString(
    result.source,
    "narrator result source"
  );
}

function createCachedResult(snapshot) {
  return Object.freeze({
    narration: snapshot.narration,
    mode: snapshot.mode,
    source: snapshot.source,
    proposedAction: null
  });
}

class NarrationProvider {
  #narrator;
  #cache;
  #promptVersion;
  #model;
  #clock;

  constructor({
    narrator,
    cache,
    promptVersion,
    model,
    clock = () => new Date()
  }) {
    requireService(
      narrator,
      ["narrate"],
      "narrator"
    );
    requireService(
      cache,
      ["find", "store"],
      "cache"
    );

    this.#promptVersion =
      normaliseRequiredString(
        promptVersion,
        "promptVersion"
      );

    this.#model = normaliseRequiredString(
      model,
      "model"
    );

    requireFunction(clock, "clock");

    this.#narrator = narrator;
    this.#cache = cache;
    this.#clock = clock;
  }

  async narrate(request) {
    if (!(request instanceof NarrationRequest)) {
      throw new TypeError(
        "NarrationProvider requires a NarrationRequest."
      );
    }

    if (!CACHEABLE_MODES.has(request.mode)) {
      return this.#narrator.narrate(request);
    }

    const fingerprint = new SceneFingerprint({
      narrativeContext:
        request.narrativeContext,
      promptVersion: this.#promptVersion
    });

    const cachedSnapshot = this.#cache.find(
      fingerprint.value,
      request.mode
    );

    if (cachedSnapshot !== null) {
      return createCachedResult(
        cachedSnapshot
      );
    }

    const narrationResult =
      await this.#narrator.narrate(request);

    validateNarrationResult(
      narrationResult
    );

    const snapshot = new NarrationSnapshot({
      fingerprint: fingerprint.value,
      mode: request.mode,
      narration:
        narrationResult.narration,
      source: narrationResult.source,
      model: this.#model,
      createdAt: this.#clock()
    });

    this.#cache.store(snapshot);

    return narrationResult;
  }
}

module.exports = {
  NarrationProvider
};
