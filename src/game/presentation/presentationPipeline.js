"use strict";

const {
  NarrationRequest
} = require("../ai/narrationRequest");

function requireService(value, methodName, fieldName) {
  if (
    !value ||
    typeof value[methodName] !== "function"
  ) {
    throw new TypeError(
      `${fieldName} must provide a ${methodName} function.`
    );
  }
}

class PresentationPipeline {
  #aiContextBuilder;
  #narrativeContextBuilder;
  #narrator;

  constructor({
    aiContextBuilder,
    narrativeContextBuilder,
    narrator
  }) {
    requireService(
      aiContextBuilder,
      "build",
      "aiContextBuilder"
    );
    requireService(
      narrativeContextBuilder,
      "build",
      "narrativeContextBuilder"
    );
    requireService(
      narrator,
      "narrate",
      "narrator"
    );
    requireService(
      narrator,
      "getMetrics",
      "narrator"
    );

    this.#aiContextBuilder = aiContextBuilder;
    this.#narrativeContextBuilder =
      narrativeContextBuilder;
    this.#narrator = narrator;
  }

  async present({
    player,
    world,
    playerInput,
    eventHistory = null,
    recentEventLimit = 10,
    mode = "narrate_action",
    instructions = {}
  }) {
    const aiContext = this.#aiContextBuilder.build({
      player,
      world,
      eventHistory,
      recentEventLimit
    });

    const narrativeContext =
      this.#narrativeContextBuilder.build(
        aiContext
      );

    const request = new NarrationRequest({
      playerInput,
      narrativeContext,
      mode,
      instructions
    });

    return this.#narrator.narrate(request);
  }

  getMetrics() {
    return this.#narrator.getMetrics();
  }
}

module.exports = {
  PresentationPipeline
};
