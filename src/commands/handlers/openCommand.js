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
  loadItem
} = require("../../game/managers/itemManager");
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

function runOpenCommand(
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
  const presentationPipeline =
    services.presentationPipeline ??
    defaultPresentationPipeline;
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

  log(result.message);

  if (!result.success) {
    return;
  }

  const container = result.data.container;

  if (container.items.length === 0) {
    log("It is empty.");
  } else {
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

  const world = loadWorldService();
  const eventServices =
    getEventServicesService();

  const narrationResult =
    presentationPipeline.present({
      player,
      world,
      playerInput:
        `I open ${containerInput}.`,
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
  runOpenCommand
};
