const { loadLocation, saveLocation } = require("./locationManager");
const { movePlayer } = require("./movementManager");
const { loadWorld, saveWorld } = require("./worldManager");
const { advanceWorldTime } = require("./timeSystem");
const {
  getInventory,
  addItem,
  removeItem
} = require("./inventorySystem");
const {
  addItem: addItemToLocation,
  removeItem: removeItemFromLocation
} = require("./locationSystem");
const { savePlayer } = require("./playerManager");
const {
  addItem: addItemToContainer,
  removeItem: removeItemFromContainer
} = require("./containerSystem");
const {
  resolveItem,
  resolveNpc,
  resolveContainer
} = require("./entityResolver");
const {
  saveContainer
} = require("./containerManager");

function performAction(player, action) {
  if (action.type === "look") {
    const location = loadLocation(player.location);

    return {
      success: true,
      message: "You look around.",
      data: {
        location
      }
    };
  }

  if (action.type === "move") {
    const newLocation = movePlayer(player, action.exit);

    if (!newLocation) {
      return {
        success: false,
        message: "You cannot go that way.",
        data: {}
      };
    }

    return {
      success: true,
      message: `You move to ${newLocation.name}.`,
      data: {
        location: newLocation
      }
    };
  }

  if (action.type === "wait") {
    const world = loadWorld();
    const events = advanceWorldTime(world, action.minutes);

    saveWorld(world);

    return {
      success: true,
      message: `You wait for ${action.minutes} minutes.`,
      data: {
        world,
        events
      }
    };
  }

  if (action.type === "inventory") {
    const inventory = getInventory(player);

    return {
      success: true,
      message: "You check your inventory.",
      data: {
        inventory
      }
    };
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
    const npc = resolveNpc(action.npcInput);

    if (!npc) {
      return {
        success: false,
        message: "I do not recognise that person.",
        data: {}
      };
    }

    const location = loadLocation(player.location);
    const npcIds = location.npcs || [];

    if (!npcIds.includes(npc.id)) {
      return {
        success: false,
        message: "That person is not here.",
        data: {}
      };
    }

    return {
      success: true,
      message: npc.dialogue,
      data: {
        npc
      }
    };
  }

  if (action.type === "open") {
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

    container.isOpen = true;
    saveContainer(container);

    return {
      success: true,
      message: `You open ${container.name}.`,
      data: {
        container
      }
    };
  }

  if (action.type === "takeFromContainer") {
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

    const removedItem = removeItemFromContainer(container, item.id);

    if (!removedItem) {
      return {
        success: false,
        message: `${item.name} is not inside ${container.name}.`,
        data: {}
      };
    }

    addItem(player, item.id);

    saveContainer(container);
    savePlayer(player);

    return {
      success: true,
      message: `You take ${item.name} from ${container.name}.`,
      data: {
        itemId: item.id,
        containerId: container.id
      }
    };
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