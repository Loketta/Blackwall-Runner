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

function performTakeFromContainerAction(context) {
  const item = resolveItem(context.action.itemInput);

  if (!item) {
    return {
      success: false,
      message: "I do not recognise that item.",
      data: {}
    };
  }

  const container = resolveContainer(
    context.action.containerInput
  );

  if (!container) {
    return {
      success: false,
      message: "I do not recognise that container.",
      data: {}
    };
  }

  const location = loadLocation(context.player.location);
  const locationObjects = location.objects || [];

  if (!locationObjects.includes(container.id)) {
    return {
      success: false,
      message: "That container is not here.",
      data: {}
    };
  }

  if (container.isLocked) {
    return {
      success: false,
      message: `${container.name} is locked.`,
      data: {
        containerId: container.id
      }
    };
  }

  if (!container.isOpen) {
    return {
      success: false,
      message: `${container.name} is closed.`,
      data: {
        containerId: container.id
      }
    };
  }

  const removedItem = removeItemFromContainer(
    container,
    item.id
  );

  if (!removedItem) {
    return {
      success: false,
      message: `${item.name} is not inside ${container.name}.`,
      data: {}
    };
  }

  addItem(context.player, item.id);
  saveContainer(container);
  savePlayer(context.player);

  return {
    success: true,
    message: `You take ${item.name} from ${container.name}.`,
    data: {
      itemId: item.id,
      containerId: container.id
    }
  };
}

module.exports = {
  performTakeFromContainerAction
};
