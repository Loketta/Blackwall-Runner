const {
  loadLocation
} = require("../managers/locationManager");
const {
  resolveContainer
} = require("../resolution/entityResolver");
const {
  saveContainer
} = require("../managers/containerManager");

function performOpenContainerAction(context) {
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

module.exports = {
  performOpenContainerAction
};
