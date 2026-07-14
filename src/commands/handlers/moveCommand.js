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

const defaultPresentationPipeline =
  createPresentationPipeline();

async function runMoveCommand(
  player,
  args,
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

  const exitName = args[0];
  const eventServices =
    getEventServicesService();

  const result = performActionService(
    player,
    {
      type: "move",
      exit: exitName
    },
    eventServices
  );

  log(result.message);

  if (!result.success) {
    return;
  }

  const commandNarrationService =
    services.commandNarrationService ??
    new CommandNarrationService({
      loadWorld: loadWorldService,

      getEventServices() {
        return eventServices;
      },

      presentationPipeline
    });

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
          playerInput:
            `I move through ${exitName}.`,
          mode: "narrate_action",
          instructions: {
            preservePlayerAgency: true,
            useOnlyProvidedFacts: true
          }
        });
    },

    renderNarration(narrationResult) {
      log("");
      describeLocationService(
        result.data.location
      );
      log("");
      log(narrationResult.narration);
    },

    renderFallback() {
      log("");
      describeLocationService(
        result.data.location
      );
    }
  });
}

module.exports = {
  runMoveCommand
};
