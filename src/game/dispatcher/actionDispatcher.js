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
const { performDropAction } = require("../actions/dropAction");
const { performDropIntoContainerAction } = require("../actions/dropIntoContainerAction");
const { addItem } = require("../systems/inventorySystem");
const { removeItem: removeItemFromLocation } = require("../systems/locationSystem");
const { savePlayer } = require("../managers/playerManager");
const { resolveItem } = require("../resolution/entityResolver");

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
    return performDropAction(player, action);
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
    return performDropIntoContainerAction(player, action);
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