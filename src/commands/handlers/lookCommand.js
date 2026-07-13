"use strict";

const {
  loadRuntimeConfig
} = require("../../config/runtimeConfig");
const {
  describeLocation
} = require("../../game/presentation/locationDescriber");
const {
  createPresentationPipeline
} = require(
  "../../game/presentation/createPresentationPipeline"
);
const {
  PresentationPolicy
} = require(
  "../../game/presentation/presentationPolicy"
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
  const configLoader =
    services.configLoader ?? loadRuntimeConfig;
  const log = services.log ?? console.log;

  const result = performActionService(player, {
    type: "look"
  });

  if (!result.success) {
    log(result.message);
    return;
  }

  const presentationMode =
    services.presentationMode ??
    configLoader().presentationMode;

  const presentationPolicy =
    services.presentationPolicy ??
    new PresentationPolicy({
      mode: presentationMode
    });

  await presentationPolicy.present({
    async createNarration() {
      const world = loadWorldService();
      const eventServices =
        getEventServicesService();

      return presentationPipeline.present({
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
    },

    renderNarration(narrationResult) {
      log(narrationResult.narration);
    },

    renderFallback() {
      describeLocationService(
        result.data.location
      );
    }
  });
}

module.exports = {
  runLookCommand
};
