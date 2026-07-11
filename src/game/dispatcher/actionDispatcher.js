const { loadLocation, saveLocation } = require("../managers/locationManager");
const {
  performWaitAction
} = require("../actions/waitAction");
const { performLookAction } = require("../actions/lookAction");
const { performInventoryAction } = require("../actions/inventoryAction");
const { performMoveAction } = require("../actions/moveAction");
const { performTalkAction } = require("../actions/talkAction");
const { performOpenContainerAction } = require("../actions/openContainerAction");
const { performTakeFromContainerAction } = require("../actions/takeFromContainerAction");
const { addItem, removeItem } = require("../systems/inventorySystem");
const {
  addItem: addItemToLocation,
  removeItem: removeItemFromLocation
} = require("../systems/locationSystem");
const { savePlayer } = require("../managers/playerManager");
const {
  addItem: addItemToContainer,
  removeItem: removeItemFromContainer
} = require("../systems/containerSystem");
const { resolveItem, resolveContainer } = require("../resolution/entityResolver");
const {
  saveContainer
} = require("../managers/containerManager");

function performAction(player, action) {
  if (action.type === "look") {
    return performLookAction(player);
  }

  if (action.type === "move") {
    return performMoveAction(player, action);
  }

  if (action.type === "wait") {
    return performWaitAction(action);
  }

  if (action.type === "inventory") {
  return performInventoryAction(player);
}

  if (action.type === "take") {
    const item = resolveItem(action.itemInput);

    if (!item) {
      return {
        success: false,
        message: "I do not recognise that item.",
        data: {}
      };
    }

    const location = loadLocation(player.location);
    const removedItem = removeItemFromLocation(location, item.id);

    if (!removedItem) {
      return {
        success: false,
        message: "That item is not here.",
        data: {}
      };
    }

    addItem(player, item.id);

    saveLocation(location);
    savePlayer(player);

    return {
      success: true,
      message: `You take ${item.name}.`,
      data: {
        itemId: item.id
      }
    };
  }

  if (action.type === "drop") {
    const item = resolveItem(action.itemInput);

    if (!item) {
      return {
        success: false,
        message: "I do not recognise that item.",
        data: {}
      };
    }

    const location = loadLocation(player.location);
    const removedItem = removeItem(player, item.id);

    if (!removedItem) {
      return {
        success: false,
        message: "You do not have that item.",
        data: {}
      };
    }

    addItemToLocation(location, item.id);

    savePlayer(player);
    saveLocation(location);

    return {
      success: true,
      message: `You drop ${item.name}.`,
      data: {
        itemId: item.id
      }
    };
  }

  if (action.type === "talk") {
    return performTalkAction(player, action);
  }

  if (action.type === "open") {
    return performOpenContainerAction(player, action);
  }

  if (action.type === "takeFromContainer") {
    return performTakeFromContainerAction(player, action);
  }

  if (action.type === "dropIntoContainer") {
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

  return {
    success: false,
    message: "Unknown action.",
    data: {}
  };
}

module.exports = {
  performAction
};