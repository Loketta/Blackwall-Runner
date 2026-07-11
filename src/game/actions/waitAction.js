const { loadWorld, saveWorld } = require("../managers/worldManager");
const { advanceSimulation } = require("../simulation/simulationEngine");
const { ActionResult } = require("../results/actionResult");

function performWaitAction(context) {
  const world = loadWorld();

  const simulationResult = advanceSimulation(
    world,
    context.action.minutes
  );

  saveWorld(world);

  return ActionResult.success(
    `You wait for ${context.action.minutes} minutes.`,
    {
      world,
      events: simulationResult.events
    },
    {
      elapsedMinutes: simulationResult.elapsedMinutes
    }
  );
}

module.exports = { performWaitAction };
