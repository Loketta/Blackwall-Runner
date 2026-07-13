"use strict";

const {
  MockNarrator
} = require("./mockNarrator");
const {
  OpenAINarrator
} = require("./openAINarrator");
const {
  PromptBuilder
} = require("./promptBuilder");
const {
  createOpenAIClient
} = require("./createOpenAIClient");

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
  apiKey = null,
  client = null,
  model = null,
  promptBuilder = new PromptBuilder(),
  clientFactory = createOpenAIClient
} = {}) {
  const normalisedProvider =
    normaliseProvider(provider);

  if (normalisedProvider === "mock") {
    return new MockNarrator();
  }

  if (normalisedProvider === "openai") {
    if (typeof clientFactory !== "function") {
      throw new TypeError(
        "clientFactory must be a function."
      );
    }

    const selectedClient =
      client ??
      clientFactory({
        apiKey
      });

    return new OpenAINarrator({
      client: selectedClient,
      promptBuilder,
      model
    });
  }

  throw new RangeError(
    `Unsupported narrator provider: ${provider}`
  );
}

module.exports = {
  createNarrator
};
