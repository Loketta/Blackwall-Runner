"use strict";

const {
  NarrationRequest
} = require("./narrationRequest");

class MockNarrator {
  async narrate(request) {
    if (!(request instanceof NarrationRequest)) {
      throw new TypeError(
        "MockNarrator requires a NarrationRequest."
      );
    }

    const {
      player,
      location,
      world
    } = request.narrativeContext;

    const playerName =
      player?.name ?? "The player";
    const locationName =
      location?.name ?? "the current location";
    const weather =
      world?.weather ?? "unknown weather";

    return Object.freeze({
      narration:
        `${playerName} acts in ${locationName}. ` +
        `The weather is ${weather}.`,
      mode: request.mode,
      source: "mock",
      proposedAction: null
    });
  }
}

module.exports = {
  MockNarrator
};
