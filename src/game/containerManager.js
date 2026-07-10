const {
  loadWorldObjects,
  loadWorldObject,
  saveWorldObject
} = require("./worldObjectManager");

function toContainer(worldObject) {
  if (!worldObject || worldObject.type !== "container") {
    return undefined;
  }

  return {
    id: worldObject.id,
    type: worldObject.type,
    name: worldObject.name,
    description: worldObject.description,
    locationId: worldObject.locationId,
    items: worldObject.inventory || [],
    isOpen: Boolean(worldObject.state?.isOpen),
    isLocked: Boolean(worldObject.state?.isLocked)
  };
}

function toWorldObject(container) {
  return {
    id: container.id,
    type: "container",
    name: container.name,
    description: container.description,
    locationId: container.locationId,
    state: {
      isOpen: Boolean(container.isOpen),
      isLocked: Boolean(container.isLocked)
    },
    inventory: container.items || []
  };
}

function loadContainers() {
  return loadWorldObjects()
    .filter(function (worldObject) {
      return worldObject.type === "container";
    })
    .map(toContainer);
}

function saveContainers(containers) {
  for (const container of containers) {
    saveWorldObject(toWorldObject(container));
  }
}

function loadContainer(containerId) {
  return toContainer(loadWorldObject(containerId));
}

function saveContainer(container) {
  return saveWorldObject(toWorldObject(container));
}

module.exports = {
  loadContainers,
  saveContainers,
  loadContainer,
  saveContainer
};