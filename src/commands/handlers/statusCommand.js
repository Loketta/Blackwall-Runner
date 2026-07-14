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
  getEventServices
} = require("../../game/events/eventServices");


async function runStatusCommand(
  player,
  services = {}
) {
  const performActionService =
    services.performAction ?? performAction;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;

  const configLoader =
    services.configLoader ?? loadRuntimeConfig;
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

  function renderMechanicalOutput() {
    log("=== PLAYER STATUS ===");
    log(`Name: ${status.name}`);
    log(`Role: ${status.role}`);
    log(`Health: ${status.health}`);
    log(`Credits: ${status.credits}`);
    log(`Location: ${status.location}`);
    log(`Day: ${world.day}`);
    log(`Time: ${world.currentTime}`);
    log(`Weather: ${world.weather}`);
  }

  const commandNarrationService =
    services.commandNarrationService ??
    new CommandNarrationService({
      loadWorld() {
        return world;
      },

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
            "I check my status.",
          mode: "narrate_action",
          instructions: {
            preservePlayerAgency: true,
            useOnlyProvidedFacts: true
          }
        });
    },

    renderNarration(narrationResult) {
      renderMechanicalOutput();
      log("");
      log(narrationResult.narration);
    },

    renderFallback() {
      renderMechanicalOutput();
    }
  });
}

module.exports = {
  runStatusCommand
};
