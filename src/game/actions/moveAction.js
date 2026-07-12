"use strict";

const {
  movePlayer
} = require("../systems/movementSystem");
const {
  loadWorld
} = require("../managers/worldManager");
const {
  ActionResult
} = require("../results/actionResult");
const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

function recordCharacterTravelledEvent(
  context,
  world,
  originLocationId,
  destinationLocationId
) {
  const eventRecorder = context.services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "CharacterTravelled",
    worldTime: formatWorldTime(world),
    actorId: context.player.id,
    locationId: destinationLocationId,
    payload: {
      originLocationId,
      destinationLocationId
    },
    metadata: {
      source: "moveAction"
    }
  });
}

function performMoveAction(context) {
  const movePlayerService =
    context.services.movePlayer ?? movePlayer;
  const loadWorldService =
    context.services.loadWorld ?? loadWorld;

  const originLocationId = context.player.location;

  const newLocation = movePlayerService(
    context.player,
    context.action.exit
  );

  if (!newLocation) {
    return ActionResult.failure(
      "You cannot go that way."
    );
  }

  const world = loadWorldService();

  const recordedEvent = recordCharacterTravelledEvent(
    context,
    world,
    originLocationId,
    newLocation.id
  );

  return ActionResult.success(
    `You move to ${newLocation.name}.`,
    {
      location: newLocation,
      recordedEvent
    }
  );
}

module.exports = {
  performMoveAction,
  recordCharacterTravelledEvent
};
