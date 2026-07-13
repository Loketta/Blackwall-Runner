"use strict";

const {
  describeLocation
} = require("../../game/presentation/locationDescriber");
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

async function runLookCommand(
  player,
  services = {}
) {
  const performActionService =
    services.performAction ?? performAction;
  const describeLocationService =
    services.describeLocation ?? describeLocation;
  const loadWorldService =
    services.loadWorld ?? loadWorld;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;
  const presentationPipeline =
    services.presentationPipeline ??
    defaultPresentationPipeline;
  const log = services.log ?? console.log;

  const result = performActionService(player, {
    type: "look"
  });

  if (!result.success) {
    log(result.message);
    return;
  }

  describeLocationService(result.data.location);

  const world = loadWorldService();
  const eventServices =
    getEventServicesService();

  const narrationResult =
    await presentationPipeline.present({
      player,
      world,
      playerInput: "I look around.",
      eventHistory:
        eventServices?.eventHistory ?? null,
      mode: "describe_location",
      instructions: {
        preservePlayerAgency: true,
        useOnlyProvidedFacts: true
      }
    });

  log("");
  log(narrationResult.narration);
}

module.exports = {
  runLookCommand
};
