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

function createApplicationServices({
  presentationPipeline = null,
  presentationPipelineFactory =
    createPresentationPipeline
} = {}) {
  requireFunction(
    presentationPipelineFactory,
    "presentationPipelineFactory"
  );

  const sharedPresentationPipeline =
    presentationPipeline ??
    presentationPipelineFactory();

  if (
    !sharedPresentationPipeline ||
    typeof sharedPresentationPipeline.present !==
      "function" ||
    typeof sharedPresentationPipeline.getMetrics !==
      "function"
  ) {
    throw new TypeError(
      "presentationPipeline must provide present and getMetrics functions."
    );
  }

  return Object.freeze({
    presentationPipeline:
      sharedPresentationPipeline
  });
}

module.exports = {
  createApplicationServices
};
