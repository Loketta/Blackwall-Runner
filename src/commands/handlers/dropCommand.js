"use strict";

const {
  PresentationPipeline
} = require("../../game/presentation/presentationPipeline");
const {
  AIContextBuilder
} = require("../../game/ai/aiContextBuilder");
const {
  NarrativeContextBuilder
} = require("../../game/ai/narrativeContextBuilder");
const {
  MockNarrator
} = require("../../game/ai/mockNarrator");
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
  new PresentationPipeline({
    aiContextBuilder: new AIContextBuilder(),
    narrativeContextBuilder:
      new NarrativeContextBuilder(),
    narrator: new MockNarrator()
  });

function runDropCommand(
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

  const world = loadWorldService();

  const narrationResult =
    presentationPipeline.present({
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
