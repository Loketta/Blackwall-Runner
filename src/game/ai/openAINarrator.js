"use strict";

const {
  NarrationRequest
} = require("./narrationRequest");

function requireService(value, methodName, fieldName) {
  if (
    !value ||
    typeof value[methodName] !== "function"
  ) {
    throw new TypeError(
      `${fieldName} must provide a ${methodName} function.`
    );
  }
}

function requireClient(client) {
  if (
    !client ||
    !client.responses ||
    typeof client.responses.create !== "function"
  ) {
    throw new TypeError(
      "client must provide a responses.create function."
    );
  }
}

function requireNonEmptyString(value, fieldName) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${fieldName} must be a non-empty string.`
    );
  }
}

function requireFunction(value, fieldName) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${fieldName} must be a function.`
    );
  }
}

function normaliseTokenCount(value) {
  if (
    Number.isInteger(value) &&
    value >= 0
  ) {
    return value;
  }

  return 0;
}

class OpenAINarrator {
  #client;
  #promptBuilder;
  #model;
  #clock;

  constructor({
    client,
    promptBuilder,
    model,
    clock = () => Date.now()
  }) {
    requireClient(client);
    requireService(
      promptBuilder,
      "build",
      "promptBuilder"
    );
    requireNonEmptyString(model, "model");
    requireFunction(clock, "clock");

    this.#client = client;
    this.#promptBuilder = promptBuilder;
    this.#model = model;
    this.#clock = clock;
  }

  async narrate(request) {
    if (!(request instanceof NarrationRequest)) {
      throw new TypeError(
        "OpenAINarrator requires a NarrationRequest."
      );
    }

    const prompt =
      this.#promptBuilder.build(request);

    const startedAt = this.#clock();

    const response =
      await this.#client.responses.create({
        model: this.#model,
        instructions: prompt.systemPrompt,
        input: prompt.userPrompt
      });

    const completedAt = this.#clock();

    requireNonEmptyString(
      response?.output_text,
      "response.output_text"
    );

    const inputTokens = normaliseTokenCount(
      response?.usage?.input_tokens
    );
    const outputTokens = normaliseTokenCount(
      response?.usage?.output_tokens
    );
    const reportedTotalTokens =
      normaliseTokenCount(
        response?.usage?.total_tokens
      );

    const totalTokens =
      reportedTotalTokens > 0
        ? reportedTotalTokens
        : inputTokens + outputTokens;

    return Object.freeze({
      narration: response.output_text.trim(),
      mode: request.mode,
      source: "openai",
      proposedAction: null,
      usage: Object.freeze({
        inputTokens,
        outputTokens,
        totalTokens
      }),
      latencyMs: Math.max(
        0,
        completedAt - startedAt
      )
    });
  }
}

module.exports = {
  OpenAINarrator
};
