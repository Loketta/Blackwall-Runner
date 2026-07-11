const {
  loadLocation
} = require("../managers/locationManager");
const {
  ActionResult
} = require("../results/actionResult");

function performLookAction(context) {
  const location = loadLocation(context.player.location);

  return ActionResult.success(
    "You look around.",
    {
      location
    }
  );
}

module.exports = {
  performLookAction
};
