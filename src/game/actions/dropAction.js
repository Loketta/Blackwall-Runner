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
const {
  recordItemTransferredEvent
} = require("../events/itemTransferRecorder");

function performDropAction(context) {
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
  const removeItemService =
    context.services.removeItem ?? removeItem;
  const addItemToLocationService =
    context.services.addItemToLocation ??
    addItemToLocation;

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

  const removedItem = removeItemService(
    context.player,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      "You do not have that item."
    );
  }

  addItemToLocationService(location, item.id);
  savePlayerService(context.player);
  saveLocationService(location);

  const world = loadWorldService();

  const recordedEvent = recordItemTransferredEvent({
    context,
    world,
    itemId: item.id,
    fromEntityId: context.player.id,
    toEntityId: location.id,
    source: "dropAction"
  });

  return ActionResult.success(
    `You drop ${item.name}.`,
    {
      itemId: item.id,
      recordedEvent
    }
  );
}

module.exports = {
  performDropAction
};
