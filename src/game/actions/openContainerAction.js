const {
  loadLocation
} = require("../managers/locationManager");
const {
  resolveContainer
} = require("../resolution/entityResolver");
const {
  saveContainer
} = require("../managers/containerManager");
const {
  ActionResult
} = require("../results/actionResult");

function performOpenContainerAction(context) {
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

  container.isOpen = true;
  saveContainer(container);

  return ActionResult.success(
    `You open ${container.name}.`,
    {
      container
    }
  );
}

module.exports = {
  performOpenContainerAction
};
