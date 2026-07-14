"use strict";

function requireService(
  value,
  methodName,
  fieldName
) {
  if (
    !value ||
    typeof value[methodName] !== "function"
  ) {
    throw new TypeError(
      `${fieldName} must provide a ${methodName} function.`
    );
  }
}

class CommandNarrationService {
  #loadWorld;
  #getEventServices;
  #presentationPipeline;

  constructor({
    loadWorld,
    getEventServices,
    presentationPipeline
  }) {
    if (typeof loadWorld !== "function") {
      throw new TypeError(
        "loadWorld must be a function."
      );
    }

    if (typeof getEventServices !== "function") {
      throw new TypeError(
        "getEventServices must be a function."
      );
    }

    requireService(
      presentationPipeline,
      "present",
      "presentationPipeline"
    );

    this.#loadWorld = loadWorld;
    this.#getEventServices =
      getEventServices;
    this.#presentationPipeline =
      presentationPipeline;
  }

  async createNarration({
    player,
    playerInput,
    mode = "narrate_action",
    instructions = {},
    recentEventLimit = 10
  }) {
    const world = this.#loadWorld();
    const eventServices =
      this.#getEventServices();

    return this.#presentationPipeline.present({
      player,
      world,
      playerInput,
      eventHistory:
        eventServices?.eventHistory ?? null,
      recentEventLimit,
      mode,
      instructions
    });
  }
}

module.exports = {
  CommandNarrationService
};
