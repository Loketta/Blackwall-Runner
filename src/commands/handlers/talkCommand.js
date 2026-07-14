"use strict";

const {
  loadRuntimeConfig
} = require("../../config/runtimeConfig");
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


async function runTalkCommand(
  player,
  args,
  services = {}
) {
  const performActionService =
    services.performAction ?? performAction;
  const loadWorldService =
    services.loadWorld ?? loadWorld;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;

  const configLoader =
    services.configLoader ?? loadRuntimeConfig;
  const log = services.log ?? console.log;

  const npcInput = args.join(" ");

  const result = performActionService(player, {
    type: "talk",
    npcInput
  });

  if (!result.success) {
    log(result.message);
    return;
  }

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
            `I talk to ${npcInput}.`,
          mode: "narrate_action",
          instructions: {
            preservePlayerAgency: true,
            useOnlyProvidedFacts: true
          }
        });
    },

    renderNarration(narrationResult) {
      log(result.message);
      log("");
      log(narrationResult.narration);
    },

    renderFallback() {
      log(result.message);
    }
  });
}

module.exports = {
  runTalkCommand
};
