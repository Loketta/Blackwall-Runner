"use strict";

const {
  loadRuntimeConfig
} = require("../../config/runtimeConfig");
const {
  describeLocation
} = require("../../game/presentation/locationDescriber");
const {
  requirePresentationPipeline
} = require(
  "../services/requirePresentationPipeline"
);
const {
  CommandNarrationService
} = require(
  "../../game/presentation/commandNarrationService"
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

  const configLoader =
    services.configLoader ?? loadRuntimeConfig;

  const commandNarrationService =
    services.commandNarrationService ??
    new CommandNarrationService({
      loadWorld: loadWorldService,
      getEventServices:
        getEventServicesService,
      presentationPipeline:
        requirePresentationPipeline(
          services
        )
    });

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
    createNarration() {
      return commandNarrationService
        .createNarration({
          player,
          playerInput: "I look around.",
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
