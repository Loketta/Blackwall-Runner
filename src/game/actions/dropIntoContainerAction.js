"use strict";

const {
  loadLocation
} = require("../managers/locationManager");
const {
  savePlayer
} = require("../managers/playerManager");
const {
  saveContainer
} = require("../managers/containerManager");
const {
  loadWorld
} = require("../managers/worldManager");
const {
  removeItem
} = require("../systems/inventorySystem");
const {
  addItem: addItemToContainer
} = require("../systems/containerSystem");
const {
  resolveItem,
  resolveContainer
} = require("../resolution/entityResolver");
const {
  ActionResult
} = require("../results/actionResult");
const {
  recordItemTransferredEvent
} = require("../events/itemTransferRecorder");

function performDropIntoContainerAction(context) {
  const resolveItemService =
    context.services.resolveItem ?? resolveItem;
  const resolveContainerService =
    context.services.resolveContainer ?? resolveContainer;
  const loadLocationService =
    context.services.loadLocation ?? loadLocation;
  const saveContainerService =
    context.services.saveContainer ?? saveContainer;
  const savePlayerService =
    context.services.savePlayer ?? savePlayer;
  const loadWorldService =
    context.services.loadWorld ?? loadWorld;
  const removeItemService =
    context.services.removeItem ?? removeItem;
  const addItemToContainerService =
    context.services.addItemToContainer ??
    addItemToContainer;

  const item = resolveItemService(
    context.action.itemInput
  );

  if (!item) {
    return ActionResult.failure(
      "I do not recognise that item."
    );
  }

  const container = resolveContainerService(
    context.action.containerInput
  );

  if (!container) {
    return ActionResult.failure(
      "I do not recognise that container."
    );
  }

  const location = loadLocationService(
    context.player.location
  );

  const locationObjects = location.objects || [];

  if (!locationObjects.includes(container.id)) {
    return ActionResult.failure(
      "That container is not here."
    );
  }

  if (container.isLocked) {
    return ActionResult.failure(
      `${container.name} is locked.`,
      {
        containerId: container.id
      }
    );
  }

  if (!container.isOpen) {
    return ActionResult.failure(
      `${container.name} is closed.`,
      {
        containerId: container.id
      }
    );
  }

  const removedItem = removeItemService(
    context.player,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      "You do not have that item."
    );
  }

  addItemToContainerService(
    container,
    item.id
  );

  savePlayerService(context.player);
  saveContainerService(container);

  const world = loadWorldService();

  const recordedEvent =
    recordItemTransferredEvent({
      context,
      world,
      itemId: item.id,
      fromEntityId: context.player.id,
      toEntityId: container.id,
      source: "dropIntoContainerAction"
    });

  return ActionResult.success(
    `You place ${item.name} inside ${container.name}.`,
    {
      itemId: item.id,
      containerId: container.id,
      recordedEvent
    }
  );
}

module.exports = {
  performDropIntoContainerAction
};
