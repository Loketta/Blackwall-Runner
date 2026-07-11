const {
  loadLocation,
  saveLocation
} = require("../managers/locationManager");
const {
  savePlayer
} = require("../managers/playerManager");
const {
  addItem
} = require("../systems/inventorySystem");
const {
  removeItem: removeItemFromLocation
} = require("../systems/locationSystem");
const {
  resolveItem
} = require("../resolution/entityResolver");

function performTakeAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return {
      success: false,
      message: "I do not recognise that item.",
      data: {}
    };
  }

  const location = loadLocation(context.player.location);
  const removedItem = removeItemFromLocation(
    location,
    item.id
  );

  if (!removedItem) {
    return {
      success: false,
      message: "That item is not here.",
      data: {}
    };
  }

  addItem(context.player, item.id);
  saveLocation(location);
  savePlayer(context.player);

  return {
    success: true,
    message: `You take ${item.name}.`,
    data: {
      itemId: item.id
    }
  };
}

module.exports = {
  performTakeAction
};
