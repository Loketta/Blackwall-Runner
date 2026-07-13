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
  loadWorld
} = require("../../game/managers/worldManager");
const {
  getEventServices
} = require("../../game/events/eventServices");

const defaultPresentationPipeline =
  createPresentationPipeline();

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
  const presentationPipeline =
    services.presentationPipeline ??
    defaultPresentationPipeline;
  const log = services.log ?? console.log;

  const npcInput = args.join(" ");

  const result = performActionService(player, {
    type: "talk",
    npcInput
  });

  log(result.message);

  if (!result.success) {
    return;
  }

  const world = loadWorldService();
  const eventServices =
    getEventServicesService();

  const narrationResult =
    await presentationPipeline.present({
      player,
      world,
      playerInput:
        `I talk to ${npcInput}.`,
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
  runTalkCommand
};
