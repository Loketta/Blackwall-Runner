"use strict";

const { loadWorld, saveWorld } = require("../managers/worldManager");
const { advanceSimulation } = require("../simulation/simulationEngine");
const { ActionResult } = require("../results/actionResult");

function formatWorldTime(world) {
  const year = String(world.calendar.year).padStart(4, "0");
  const month = String(world.calendar.month).padStart(2, "0");
  const day = String(world.calendar.dayOfMonth).padStart(2, "0");

  return `${year}-${month}-${day}T${world.currentTime}:00`;
}

function recordTimePassedEvent(context, world, simulationResult) {
  const eventRecorder = context.services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "TimePassed",
    worldTime: formatWorldTime(world),
    actorId: context.player.id,
    locationId: context.player.locationId ?? null,
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
  formatWorldTime,
  recordTimePassedEvent
};
