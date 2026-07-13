"use strict";

const {
  NarrationRequest
} = require("./narrationRequest");

const SYSTEM_RULES = Object.freeze([
  "You are the narrator for a persistent tabletop RPG simulation.",
  "Treat the supplied engine context as authoritative truth.",
  "Do not invent mechanics, state changes, entities, items or events.",
  "Do not decide actions, thoughts or dialogue for the player.",
  "Use only facts contained in the supplied narrative context.",
  "Describe consequences without changing the underlying game state.",
  "Return plain-text narration only."
]);

function formatSection(title, content) {
  return [
    `=== ${title} ===`,
    content
  ].join("\n");
}

class PromptBuilder {
  build(request) {
    if (!(request instanceof NarrationRequest)) {
      throw new TypeError(
        "PromptBuilder requires a NarrationRequest."
      );
    }

    const systemPrompt = [
      SYSTEM_RULES[0],
      "",
      "Rules:",
      ...SYSTEM_RULES.slice(1).map(
        (rule) => `- ${rule}`
      )
    ].join("\n");

    const userPrompt = [
      formatSection(
        "NARRATION MODE",
        request.mode
      ),
      "",
      formatSection(
        "PLAYER INPUT",
        request.playerInput
      ),
      "",
      formatSection(
        "NARRATIVE CONTEXT",
        JSON.stringify(
          request.narrativeContext,
          null,
          2
        )
      ),
      "",
      formatSection(
        "ADDITIONAL INSTRUCTIONS",
        JSON.stringify(
          request.instructions,
          null,
          2
        )
      )
    ].join("\n");

    const metadata = Object.freeze({
      mode: request.mode,
      outputFormat: "plain_text"
    });

    return Object.freeze({
      systemPrompt,
      userPrompt,
      metadata
    });
  }
}

module.exports = {
  PromptBuilder
};
