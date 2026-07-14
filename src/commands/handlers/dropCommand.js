"use strict";

const {
  requirePresentationPipeline
} = require(
  "../services/requirePresentationPipeline"
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


async function runDropCommand(
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

  const log = services.log ?? console.log;

  const intoIndex = args.findIndex(function (arg) {
    return arg.toLowerCase() === "into";
  });

  let action;
  let playerInput;

  if (intoIndex === -1) {
    const itemInput = args.join(" ").trim();

    action = {
      type: "drop",
      itemInput
    };

    playerInput = `I drop ${itemInput}.`;
  } else {
    const itemInput =
      args.slice(0, intoIndex).join(" ").trim();
    const containerInput =
      args.slice(intoIndex + 1).join(" ").trim();

    if (!itemInput || !containerInput) {
      log("Use: drop <item> into <container>");
      return;
    }

    action = {
      type: "dropIntoContainer",
      itemInput,
      containerInput
    };

    playerInput =
      `I place ${itemInput} into ${containerInput}.`;
  }

  const eventServices =
    getEventServicesService();

  const result = performActionService(
    player,
    action,
    eventServices
  );

  log(result.message);

  if (!result.success) {
    return;
  }

  const presentationPipeline =
    requirePresentationPipeline(services);

  const world = loadWorldService();

  const narrationResult =
    await presentationPipeline.present({
      player,
      world,
      playerInput,
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
  runDropCommand
};
