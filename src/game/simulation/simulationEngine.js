const { advanceWorldTime } = require("../time/timeSystem");
const { processWorldEvents } = require("../events/eventSystem");

function validateElapsedMinutes(minutes) {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error(
      "Simulation time must be a non-negative integer number of minutes."
    );
  }
}

function advanceSimulation(world, minutes, services = {}) {
  validateElapsedMinutes(minutes);

  if (minutes === 0) {
    return {
      elapsedMinutes: 0,
      events: []
    };
  }

  advanceWorldTime(world, minutes);

  const events = processWorldEvents(world, services);

  return {
    elapsedMinutes: minutes,
    events
  };
}

module.exports = {
  advanceSimulation
};
