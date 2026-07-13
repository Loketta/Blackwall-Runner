"use strict";

const {
  createPresentationPipeline
} = require(
  "../../game/presentation/createPresentationPipeline"
);
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
  createPresentationPipeline();

async function runInventoryCommand(
  player,
  services = {}
) {
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
    await presentationPipeline.present({
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
