"use strict";

const OpenAI = require("openai");

function requireNonEmptyString(
  value,
  fieldName
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }
}

function createOpenAIClient({
  apiKey,
  Client = OpenAI
} = {}) {
  requireNonEmptyString(
    apiKey,
    "apiKey"
  );

  if (typeof Client !== "function") {
    throw new TypeError(
      "Client must be a constructor."
    );
  }

  return new Client({
    apiKey: apiKey.trim()
  });
}

module.exports = {
  createOpenAIClient
};
