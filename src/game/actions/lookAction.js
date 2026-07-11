const { loadLocation } = require("../managers/locationManager");

function performLookAction(player) {
  const location = loadLocation(player.location);

  return {
    success: true,
    message: "You look around.",
    data: {
      location
    }
  };
}

module.exports = {
  performLookAction
};
