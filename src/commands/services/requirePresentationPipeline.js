"use strict";

function requirePresentationPipeline(
  services = {}
) {
  const presentationPipeline =
    services.presentationPipeline;

  if (
    !presentationPipeline ||
    typeof presentationPipeline.present !==
      "function"
  ) {
    throw new TypeError(
      "services.presentationPipeline must provide a present function."
    );
  }

  return presentationPipeline;
}

module.exports = {
  requirePresentationPipeline
};
