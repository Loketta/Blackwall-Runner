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
  NarrationCache
} = require("./narrationCache");
const {
  NarrationProvider
} = require("./narrationProvider");
const {
  PresentationPipeline
} = require("./presentationPipeline");

function normaliseModelLabel(
  value,
  fallback
) {
  if (
    typeof value === "string" &&
    value.trim() !== ""
  ) {
    return value.trim();
  }

  return fallback;
}

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
  narrationCache = new NarrationCache(),
  promptVersion = "scene-v1",
  clock = () => new Date(),
  configLoader = loadRuntimeConfig,
  clientFactory = undefined
} = {}) {
  let selectedNarrator = narrator;
  let selectedProvider = provider;
  let selectedModel = model;

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

    selectedProvider = config.aiProvider;
    selectedModel =
      model ?? config.openAIModel;

    selectedNarrator = createNarrator({
      provider: selectedProvider,
      apiKey:
        apiKey ?? config.openAIApiKey,
      client,
      model: selectedModel,
      promptBuilder,
      clientFactory
    });
  }

  const modelLabel = normaliseModelLabel(
    selectedModel,
    selectedNarrator === narrator
      ? "injected"
      : String(selectedProvider)
          .trim()
          .toLowerCase()
  );

  const narrationProvider =
    new NarrationProvider({
      narrator: selectedNarrator,
      cache: narrationCache,
      promptVersion,
      model: modelLabel,
      clock
    });

  return new PresentationPipeline({
    aiContextBuilder,
    narrativeContextBuilder,
    narrator: narrationProvider
  });
}

module.exports = {
  createNarrator,
  createPresentationPipeline
};
