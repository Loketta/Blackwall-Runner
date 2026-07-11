const {
  movePlayer
} = require("../systems/movementSystem");
const {
  ActionResult
} = require("../results/actionResult");

function performMoveAction(context) {
  const newLocation = movePlayer(
    context.player,
    context.action.exit
  );

  if (!newLocation) {
    return ActionResult.failure(
      "You cannot go that way."
    );
  }

  return ActionResult.success(
    `You move to ${newLocation.name}.`,
    {
      location: newLocation
    }
  );
}

module.exports = {
  performMoveAction
};
