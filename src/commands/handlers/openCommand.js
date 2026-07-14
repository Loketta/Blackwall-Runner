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
  loadItem
} = require("../../game/managers/itemManager");
const {
  loadWorld
} = require("../../game/managers/worldManager");
const {
  getEventServices
} = require("../../game/events/eventServices");


async function runOpenCommand(
  player,
  args,
  services = {}
) {
  const performActionService =
    services.performAction ?? performAction;
  const loadItemService =
    services.loadItem ?? loadItem;
  const loadWorldService =
    services.loadWorld ?? loadWorld;
  const getEventServicesService =
    services.getEventServices ?? getEventServices;

  const configLoader =
    services.configLoader ?? loadRuntimeConfig;
  const log = services.log ?? console.log;

  const containerInput =
    args.join(" ").trim();

  if (!containerInput) {
    log("What do you want to open?");
    return;
  }

  const result = performActionService(player, {
    type: "open",
    containerInput
  });

  if (!result.success) {
    log(result.message);
    return;
  }

  function renderMechanicalOutput() {
    log(result.message);

    const container = result.data.container;

    if (container.items.length === 0) {
      log("It is empty.");
      return;
    }

    log("");
    log("Contents:");

    for (const itemId of container.items) {
      const item = loadItemService(itemId);

      if (item) {
        log(`- ${item.name}`);
      } else {
        log(`- Unknown Item (${itemId})`);
      }
    }
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
            `I open ${containerInput}.`,
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
  runOpenCommand
};
