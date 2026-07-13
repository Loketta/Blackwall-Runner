"use strict";

const {
  describeLocation
} = require("../../game/presentation/locationDescriber");
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

function runMoveCommand(
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

  log("");
  describeLocationService(result.data.location);

  const world = loadWorldService();

  const narrationResult =
    presentationPipeline.present({
      player,
      world,
      playerInput:
        `I move through ${exitName}.`,
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
  runMoveCommand
};
