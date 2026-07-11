const { loadLocation } = require("../managers/locationManager");
const { savePlayer } = require("../managers/playerManager");
const { saveContainer } = require("../managers/containerManager");
const { removeItem } = require("../systems/inventorySystem");
const { addItem: addItemToContainer } = require("../systems/containerSystem");
const {
  resolveItem,
  resolveContainer
} = require("../resolution/entityResolver");

function performDropIntoContainerAction(player, action) {
  const item = resolveItem(action.itemInput);

  if (!item) {
    return {
      success: false,
      message: "I do not recognise that item.",
      data: {}
    };
  }

  const container = resolveContainer(action.containerInput);

  if (!container) {
    return {
      success: false,
      message: "I do not recognise that container.",
      data: {}
    };
  }

  const location = loadLocation(player.location);
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

  const removedItem = removeItem(player, item.id);

  if (!removedItem) {
    return {
      success: false,
      message: "You do not have that item.",
      data: {}
    };
  }

  addItemToContainer(container, item.id);
  savePlayer(player);
  saveContainer(container);

  return {
    success: true,
    message: `You place ${item.name} inside ${container.name}.`,
    data: {
      itemId: item.id,
      containerId: container.id
    }
  };
}

module.exports = {
  performDropIntoContainerAction
};
