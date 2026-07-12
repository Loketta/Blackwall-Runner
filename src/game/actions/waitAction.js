"use strict";

const { loadWorld, saveWorld } = require("../managers/worldManager");
const { advanceSimulation } = require("../simulation/simulationEngine");
const { ActionResult } = require("../results/actionResult");
const { formatWorldTime } = require("../time/worldTimeFormatter");

function recordTimePassedEvent(context, world, simulationResult) {
  const eventRecorder = context.services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "TimePassed",
    worldTime: formatWorldTime(world),
    actorId: context.player.id,
    locationId: context.player.locationId ?? context.player.location ?? null,
    payload: {
      elapsedMinutes: simulationResult.elapsedMinutes
    },
    metadata: {
      source: "waitAction"
    }
  });
}

function performWaitAction(context) {
  const world = loadWorld();

  const simulationResult = advanceSimulation(
    world,
    context.action.minutes
  );

  saveWorld(world);

  const recordedEvent = recordTimePassedEvent(
    context,
    world,
    simulationResult
  );

  return ActionResult.success(
    `You wait for ${context.action.minutes} minutes.`,
    {
      world,
      events: simulationResult.events,
      recordedEvent
    },
    {
      elapsedMinutes: simulationResult.elapsedMinutes
    }
  );
}

module.exports = {
  performWaitAction,
  recordTimePassedEvent
};
