"use strict";

const {
  loadRuntimeConfig
} = require("../../config/runtimeConfig");
const {
  AIContextBuilder
} = require("../ai/aiContextBuilder");
const {
  NarrativeContextBuilder
} = require("../ai/narrativeContextBuilder");
const {
  PromptBuilder
} = require("../ai/promptBuilder");
const {
  createNarrator
} = require("../ai/createNarrator");
const {
  PresentationPipeline
} = require("./presentationPipeline");

function createPresentationPipeline({
  provider = null,
  apiKey = null,
  client = null,
  model = null,
  promptBuilder = new PromptBuilder(),
  aiContextBuilder = new AIContextBuilder(),
  narrativeContextBuilder =
    new NarrativeContextBuilder(),
  narrator = null,
  configLoader = loadRuntimeConfig,
  clientFactory = undefined
} = {}) {
  let selectedNarrator = narrator;

  if (selectedNarrator === null) {
    if (typeof configLoader !== "function") {
      throw new TypeError(
        "configLoader must be a function."
      );
    }

    const config =
      provider === null
        ? configLoader()
        : {
            aiProvider: provider,
            openAIApiKey: apiKey,
            openAIModel: model
          };

    selectedNarrator = createNarrator({
      provider: config.aiProvider,
      apiKey:
        apiKey ??
        config.openAIApiKey,
      client,
      model:
        model ??
        config.openAIModel,
      promptBuilder,
      clientFactory
    });
  }

  return new PresentationPipeline({
    aiContextBuilder,
    narrativeContextBuilder,
    narrator: selectedNarrator
  });
}

module.exports = {
  createNarrator,
  createPresentationPipeline
};
