const {
  loadWorld,
  saveWorld
} = require("../managers/worldManager");
const {
  advanceSimulation
} = require("../simulation/simulationEngine");

function performWaitAction(action) {
  const world = loadWorld();
  const simulationResult = advanceSimulation(
    world,
    action.minutes
  );

  saveWorld(world);

  return {
    success: true,
    message: `You wait for ${action.minutes} minutes.`,
    elapsedMinutes: simulationResult.elapsedMinutes,
    data: {
      world,
      events: simulationResult.events
    }
  };
}

module.exports = {
  performWaitAction
};