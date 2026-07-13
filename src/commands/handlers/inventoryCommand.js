"use strict";

const {
  PresentationPipeline
} = require("../../game/presentation/presentationPipeline");
const {
  AIContextBuilder
} = require("../../game/ai/aiContextBuilder");
const {
  NarrativeContextBuilder
} = require("../../game/ai/narrativeContextBuilder");
const {
  MockNarrator
} = require("../../game/ai/mockNarrator");
const {
  performAction
} = require("../../game/dispatcher/actionDispatcher");
const {
  loadWorld
} = require("../../game/managers/worldManager");
const {
  getEventServices
} = require("../../game/events/eventServices");

const defaultPresentationPipeline =
  new PresentationPipeline({
    aiContextBuilder: new AIContextBuilder(),
    narrativeContextBuilder:
      new NarrativeContextBuilder(),
    narrator: new MockNarrator()
  });

function runInventoryCommand(player, services = {}) {
  const performActionService =
    services.performAction ?? performAction;
  const loadWorldService =
    services.loadWorld ?? loadWorld;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;
  const presentationPipeline =
    services.presentationPipeline ??
    defaultPresentationPipeline;
  const log = services.log ?? console.log;

  const result = performActionService(player, {
    type: "inventory"
  });

  if (!result.success) {
    log(result.message);
    return;
  }

  log("=== INVENTORY ===");

  if (result.data.inventory.length === 0) {
    log("Your inventory is empty.");
  } else {
    for (const item of result.data.inventory) {
      log(`- ${item.name}`);
    }
  }

  const world = loadWorldService();
  const eventServices =
    getEventServicesService();

  const narrationResult =
    presentationPipeline.present({
      player,
      world,
      playerInput: "I check my inventory.",
      eventHistory:
        eventServices?.eventHistory ?? null,
      mode: "narrate_action",
      instructions: {
        preservePlayerAgency: true,
        useOnlyProvidedFacts: true
      }
    });

  log("");
  log(narrationResult.narration);
}

module.exports = {
  runInventoryCommand
};
