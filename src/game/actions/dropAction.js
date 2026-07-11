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
const {
  ActionResult
} = require("../results/actionResult");

function performDropAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return ActionResult.failure(
      "I do not recognise that item."
    );
  }

  const location = loadLocation(context.player.location);
  const removedItem = removeItem(
    context.player,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      "You do not have that item."
    );
  }

  addItemToLocation(location, item.id);
  savePlayer(context.player);
  saveLocation(location);

  return ActionResult.success(
    `You drop ${item.name}.`,
    {
      itemId: item.id
    }
  );
}

module.exports = {
  performDropAction
};
