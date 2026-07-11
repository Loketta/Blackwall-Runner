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

function performTakeFromContainerAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return ActionResult.failure(
      "I do not recognise that item."
    );
  }

  const container = resolveContainer(
    context.action.containerInput
  );

  if (!container) {
    return ActionResult.failure(
      "I do not recognise that container."
    );
  }

  const location = loadLocation(context.player.location);
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

  const removedItem = removeItemFromContainer(
    container,
    item.id
  );

  if (!removedItem) {
    return ActionResult.failure(
      `${item.name} is not inside ${container.name}.`
    );
  }

  addItem(context.player, item.id);
  saveContainer(container);
  savePlayer(context.player);

  return ActionResult.success(
    `You take ${item.name} from ${container.name}.`,
    {
      itemId: item.id,
      containerId: container.id
    }
  );
}

module.exports = {
  performTakeFromContainerAction
};
