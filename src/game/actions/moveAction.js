const { movePlayer } = require("../systems/movementSystem");

function performMoveAction(player, action) {
  const newLocation = movePlayer(player, action.exit);

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
