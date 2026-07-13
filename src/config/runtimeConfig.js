"use strict";

const dotenv = require("dotenv");

dotenv.config({
  quiet: true
});

const SUPPORTED_PROVIDERS =
  Object.freeze([
    "mock",
    "openai"
  ]);

function readOptionalString(
  environment,
  fieldName
) {
  const value = environment[fieldName];

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue === ""
    ? null
    : trimmedValue;
}

function requireSetting(
  value,
  fieldName,
  provider
) {
  if (value === null) {
    throw new Error(
      `${fieldName} is required when ` +
      `AI_PROVIDER=${provider}.`
    );
  }
}

function loadRuntimeConfig(
  environment = process.env
) {
  if (
    !environment ||
    typeof environment !== "object"
  ) {
    throw new TypeError(
      "environment must be an object."
    );
  }

  const provider = (
    readOptionalString(
      environment,
      "AI_PROVIDER"
    ) ?? "mock"
  ).toLowerCase();

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    throw new RangeError(
      `Unsupported AI_PROVIDER: ${provider}`
    );
  }

  const apiKey = readOptionalString(
    environment,
    "OPENAI_API_KEY"
  );

  const model = readOptionalString(
    environment,
    "OPENAI_MODEL"
  );

  if (provider === "openai") {
    requireSetting(
      apiKey,
      "OPENAI_API_KEY",
      provider
    );

    requireSetting(
      model,
      "OPENAI_MODEL",
      provider
    );
  }

  return Object.freeze({
    aiProvider: provider,
    openAIApiKey: apiKey,
    openAIModel: model
  });
}

module.exports = {
  loadRuntimeConfig
};
