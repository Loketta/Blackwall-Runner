const {
  loadLocation,
  saveLocation
} = require("../managers/locationManager");
const {
  savePlayer
} = require("../managers/playerManager");
const {
  removeItem
} = require("../systems/inventorySystem");
const {
  addItem: addItemToLocation
} = require("../systems/locationSystem");
const {
  resolveItem
} = require("../resolution/entityResolver");

function performDropAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return {
      success: false,
      message: "I do not recognise that item.",
      data: {}
    };
  }

  const location = loadLocation(context.player.location);
  const removedItem = removeItem(context.player, item.id);

  if (!removedItem) {
    return {
      success: false,
      message: "You do not have that item.",
      data: {}
    };
  }

  addItemToLocation(location, item.id);
  savePlayer(context.player);
  saveLocation(location);

  return {
    success: true,
    message: `You drop ${item.name}.`,
    data: {
      itemId: item.id
    }
  };
}

module.exports = {
  performDropAction
};
