"use strict";

const {
  formatLabel,
  renderView
} = require(
  "./characterCreationViews"
);

const {
  CHARACTER_CREATION_STAGE,
  createCharacterCreationStageHandlers,
  parseAttributeInput,
  parseProfessionChoiceInput,
  parseProfessionInput,
  parseSkillInput
} = require(
  "./characterCreationStageHandlers"
);

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }

  return value;
}

function requireController(controller) {
  if (
    !controller ||
    typeof controller !== "object"
  ) {
    throw new TypeError(
      "controller must be an object."
    );
  }

  const requiredMethods = [
    "start",
    "submit",
    "next",
    "previous",
    "renderCurrentStep",
    "finalise",
    "cancel",
    "isActive"
  ];

  for (const methodName of requiredMethods) {
    if (
      typeof controller[methodName] !==
      "function"
    ) {
      throw new TypeError(
        `controller.${methodName} must be a function.`
      );
    }
  }

  return controller;
}

function createCharacterCreationRenderer({
  controller,
  readInput,
  writeOutput
}) {
  const characterCreationController =
    requireController(controller);

  const read = requireFunction(
    readInput,
    "readInput"
  );

  const write = requireFunction(
    writeOutput,
    "writeOutput"
  );

  let lastRenderedView = null;
  let pendingRenderedView = null;

  function renderViewWithCache(view) {
    const renderedView = renderView(view);

    pendingRenderedView = renderedView;

    return renderedView;
  }

  function writeWithViewCache(message) {
    const isRenderedView =
      pendingRenderedView !== null &&
      message === pendingRenderedView;

    if (isRenderedView) {
      pendingRenderedView = null;

      if (message === lastRenderedView) {
        return;
      }

      lastRenderedView = message;
    }

    write(message);
  }

  const stageHandlers =
    createCharacterCreationStageHandlers({
      controller:
        characterCreationController,
      readInput: read,
      writeOutput: writeWithViewCache,
      renderView: renderViewWithCache
    });

  async function run({
    ownerId,
    platform
  }) {
    let view =
      characterCreationController.start({
        ownerId,
        platform
      });

    lastRenderedView = null;
    pendingRenderedView = null;

    while (
      characterCreationController.isActive()
    ) {
      const handler =
        stageHandlers[view.stage];

      if (typeof handler !== "function") {
        write(renderView(view));

        return Object.freeze({
          status: "stage_not_implemented",
          stage: view.stage
        });
      }

      const result = await handler(view);

      if (
        result.status === "cancelled" ||
        result.status === "completed"
      ) {
        return result;
      }

      if (
        !characterCreationController.isActive()
      ) {
        break;
      }

      view =
        characterCreationController.renderCurrentStep();
    }

    return Object.freeze({
      status: "closed"
    });
  }

  return Object.freeze({
    run,
    renderView
  });
}

module.exports = {
  CHARACTER_CREATION_STAGE,
  createCharacterCreationRenderer,
  formatLabel,
  parseAttributeInput,
  parseProfessionChoiceInput,
  parseProfessionInput,
  parseSkillInput,
  renderView
};
