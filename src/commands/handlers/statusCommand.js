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
  getEventServices
} = require("../../game/events/eventServices");

const defaultPresentationPipeline =
  createPresentationPipeline();

async function runStatusCommand(
  player,
  services = {}
) {
  const performActionService =
    services.performAction ?? performAction;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;
  const presentationPipeline =
    services.presentationPipeline ??
    defaultPresentationPipeline;
  const log = services.log ?? console.log;

  const result = performActionService(
    player,
    {
      type: "status"
    },
    services.actionServices ?? {}
  );

  if (!result.success) {
    log(result.message);
    return;
  }

  const status = result.data.status;
  const world = result.data.world;

  log("=== PLAYER STATUS ===");
  log(`Name: ${status.name}`);
  log(`Role: ${status.role}`);
  log(`Health: ${status.health}`);
  log(`Credits: ${status.credits}`);
  log(`Location: ${status.location}`);
  log(`Day: ${world.day}`);
  log(`Time: ${world.currentTime}`);
  log(`Weather: ${world.weather}`);

  const eventServices =
    getEventServicesService();

  const narrationResult =
    await presentationPipeline.present({
      player,
      world,
      playerInput: "I check my status.",
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
  runStatusCommand
};
