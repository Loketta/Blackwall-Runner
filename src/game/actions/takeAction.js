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
const {
  ActionResult
} = require("../results/actionResult");

function performTakeAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return ActionResult.failure(
      "I do not recognise that item."
    );
  }

  const location = loadLocation(context.player.location);
  const removedItem = removeItemFromLocation(
    location,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      "That item is not here."
    );
  }

  addItem(context.player, item.id);
  saveLocation(location);
  savePlayer(context.player);

  return ActionResult.success(
    `You take ${item.name}.`,
    {
      itemId: item.id
    }
  );
}

module.exports = {
  performTakeAction
};
