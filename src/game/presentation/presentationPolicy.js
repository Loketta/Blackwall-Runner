"use strict";

function requireFunction(
  value,
  fieldName
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }
}

class PresentationPolicy {
  #mode;

  constructor({
    mode
  }) {
    if (
      mode !== "developer" &&
      mode !== "player"
    ) {
      throw new RangeError(
        `Unsupported presentation mode: ${mode}`
      );
    }

    this.#mode = mode;
  }

  async present({
    createNarration,
    renderNarration,
    renderFallback
  }) {
    requireFunction(
      createNarration,
      "createNarration"
    );
    requireFunction(
      renderNarration,
      "renderNarration"
    );
    requireFunction(
      renderFallback,
      "renderFallback"
    );

    if (this.#mode === "developer") {
      renderFallback();

      return Object.freeze({
        source: "fallback",
        narrationResult: null
      });
    }

    try {
      const narrationResult =
        await createNarration();

      renderNarration(narrationResult);

      return Object.freeze({
        source: "narration",
        narrationResult
      });
    } catch (error) {
      renderFallback();

      return Object.freeze({
        source: "fallback",
        narrationResult: null
      });
    }
  }
}

module.exports = {
  PresentationPolicy
};
