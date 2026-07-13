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

class OpenAINarrator {
  #client;
  #promptBuilder;
  #model;

  constructor({
    client,
    promptBuilder,
    model
  }) {
    requireClient(client);
    requireService(
      promptBuilder,
      "build",
      "promptBuilder"
    );
    requireNonEmptyString(model, "model");

    this.#client = client;
    this.#promptBuilder = promptBuilder;
    this.#model = model;
  }

  async narrate(request) {
    if (!(request instanceof NarrationRequest)) {
      throw new TypeError(
        "OpenAINarrator requires a NarrationRequest."
      );
    }

    const prompt =
      this.#promptBuilder.build(request);

    const response =
      await this.#client.responses.create({
        model: this.#model,
        instructions: prompt.systemPrompt,
        input: prompt.userPrompt
      });

    requireNonEmptyString(
      response?.output_text,
      "response.output_text"
    );

    return Object.freeze({
      narration: response.output_text.trim(),
      mode: request.mode,
      source: "openai",
      proposedAction: null
    });
  }
}

module.exports = {
  OpenAINarrator
};
