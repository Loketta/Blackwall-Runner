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
  addItem
} = require("../systems/inventorySystem");
const {
  removeItem: removeItemFromContainer
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

function performTakeFromContainerAction(context) {
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
  const addItemService =
    context.services.addItem ?? addItem;
  const removeItemFromContainerService =
    context.services.removeItemFromContainer ??
    removeItemFromContainer;

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

  const removedItem =
    removeItemFromContainerService(
      container,
      item.id
    );

  if (!removedItem) {
    return ActionResult.failure(
      `${item.name} is not inside ${container.name}.`
    );
  }

  addItemService(
    context.player,
    item.id
  );

  saveContainerService(container);
  savePlayerService(context.player);

  const world = loadWorldService();

  const recordedEvent =
    recordItemTransferredEvent({
      context,
      world,
      itemId: item.id,
      fromEntityId: container.id,
      toEntityId: context.player.id,
      source: "takeFromContainerAction"
    });

  return ActionResult.success(
    `You take ${item.name} from ${container.name}.`,
    {
      itemId: item.id,
      containerId: container.id,
      recordedEvent
    }
  );
}

module.exports = {
  performTakeFromContainerAction
};
