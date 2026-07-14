"use strict";

const {
  createPresentationPipeline
} = require(
  "../game/presentation/createPresentationPipeline"
);

function requireFunction(
  value,
  fieldName
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }
}

function requirePresentationPipeline(
  presentationPipeline
) {
  if (
    !presentationPipeline ||
    typeof presentationPipeline.present !==
      "function" ||
    typeof presentationPipeline.getMetrics !==
      "function"
  ) {
    throw new TypeError(
      "presentationPipeline must provide present and getMetrics functions."
    );
  }
}

function requireWorldManager(
  worldManager
) {
  if (worldManager === null) {
    return;
  }

  if (
    !worldManager ||
    typeof worldManager.getActiveWorld !==
      "function"
  ) {
    throw new TypeError(
      "worldManager must provide a getActiveWorld function."
    );
  }
}

function createApplicationServices({
  presentationPipeline = null,
  presentationPipelineFactory =
    createPresentationPipeline,
  worldManager = null
} = {}) {
  requireFunction(
    presentationPipelineFactory,
    "presentationPipelineFactory"
  );

  const sharedPresentationPipeline =
    presentationPipeline ??
    presentationPipelineFactory();

  requirePresentationPipeline(
    sharedPresentationPipeline
  );

  requireWorldManager(worldManager);

  return Object.freeze({
    presentationPipeline:
      sharedPresentationPipeline,
    worldManager
  });
}

module.exports = {
  createApplicationServices
};
