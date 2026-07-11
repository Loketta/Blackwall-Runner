const {
  loadLocation
} = require("../managers/locationManager");

function performLookAction(context) {
  const location = loadLocation(context.player.location);

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
