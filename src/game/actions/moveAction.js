const {
  movePlayer
} = require("../systems/movementSystem");

function performMoveAction(context) {
  const newLocation = movePlayer(
    context.player,
    context.action.exit
  );

  if (!newLocation) {
    return {
      success: false,
      message: "You cannot go that way.",
      data: {}
    };
  }

  return {
    success: true,
    message: `You move to ${newLocation.name}.`,
    data: {
      location: newLocation
    }
  };
}

module.exports = {
  performMoveAction
};
