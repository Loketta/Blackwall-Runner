"use strict";

const {
  AIContextBuilder
} = require("../ai/aiContextBuilder");
const {
  NarrativeContextBuilder
} = require("../ai/narrativeContextBuilder");
const {
  MockNarrator
} = require("../ai/mockNarrator");
const {
  OpenAINarrator
} = require("../ai/openAINarrator");
const {
  PromptBuilder
} = require("../ai/promptBuilder");
const {
  PresentationPipeline
} = require("./presentationPipeline");

function normaliseProvider(provider) {
  if (
    typeof provider !== "string" ||
    provider.trim() === ""
  ) {
    throw new TypeError(
      "provider must be a non-empty string."
    );
  }

  return provider.trim().toLowerCase();
}

function createNarrator({
  provider = "mock",
  client = null,
  model = null,
  promptBuilder = new PromptBuilder()
} = {}) {
  const normalisedProvider =
    normaliseProvider(provider);

  if (normalisedProvider === "mock") {
    return new MockNarrator();
  }

  if (normalisedProvider === "openai") {
    return new OpenAINarrator({
      client,
      promptBuilder,
      model
    });
  }

  throw new RangeError(
    `Unsupported narrator provider: ${provider}`
  );
}

function createPresentationPipeline({
  provider = "mock",
  client = null,
  model = null,
  promptBuilder = new PromptBuilder(),
  aiContextBuilder = new AIContextBuilder(),
  narrativeContextBuilder =
    new NarrativeContextBuilder(),
  narrator = null
} = {}) {
  const selectedNarrator =
    narrator ??
    createNarrator({
      provider,
      client,
      model,
      promptBuilder
    });

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
