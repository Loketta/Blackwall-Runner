"use strict";

const {
  loadLocation,
  saveLocation
} = require("../managers/locationManager");
const {
  savePlayer
} = require("../managers/playerManager");
const {
  loadWorld
} = require("../managers/worldManager");
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
const {
  recordItemTransferredEvent
} = require("../events/itemTransferRecorder");

function performTakeAction(context) {
  const resolveItemService =
    context.services.resolveItem ?? resolveItem;
  const loadLocationService =
    context.services.loadLocation ?? loadLocation;
  const saveLocationService =
    context.services.saveLocation ?? saveLocation;
  const savePlayerService =
    context.services.savePlayer ?? savePlayer;
  const loadWorldService =
    context.services.loadWorld ?? loadWorld;
  const addItemService =
    context.services.addItem ?? addItem;
  const removeItemFromLocationService =
    context.services.removeItemFromLocation ??
    removeItemFromLocation;

  const item = resolveItemService(
    context.action.itemInput
  );

  if (!item) {
    return ActionResult.failure(
      "I do not recognise that item."
    );
  }

  const location = loadLocationService(
    context.player.location
  );

  const removedItem = removeItemFromLocationService(
    location,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      "That item is not here."
    );
  }

  addItemService(context.player, item.id);
  saveLocationService(location);
  savePlayerService(context.player);

  const world = loadWorldService();

  const recordedEvent = recordItemTransferredEvent({
    context,
    world,
    itemId: item.id,
    fromEntityId: location.id,
    toEntityId: context.player.id,
    source: "takeAction"
  });

  return ActionResult.success(
    `You take ${item.name}.`,
    {
      itemId: item.id,
      recordedEvent
    }
  );
}

module.exports = {
  performTakeAction
};
