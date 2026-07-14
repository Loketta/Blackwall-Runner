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


async function runTakeCommand(
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

  const fromIndex = args.findIndex(function (arg) {
    return arg.toLowerCase() === "from";
  });

  let action;
  let playerInput;

  if (fromIndex === -1) {
    const itemInput = args.join(" ").trim();

    action = {
      type: "take",
      itemInput
    };

    playerInput = `I take ${itemInput}.`;
  } else {
    const itemInput =
      args.slice(0, fromIndex).join(" ").trim();
    const containerInput =
      args.slice(fromIndex + 1).join(" ").trim();

    if (!itemInput || !containerInput) {
      log("Use: take <item> from <container>");
      return;
    }

    action = {
      type: "takeFromContainer",
      itemInput,
      containerInput
    };

    playerInput =
      `I take ${itemInput} from ${containerInput}.`;
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
  runTakeCommand
};
