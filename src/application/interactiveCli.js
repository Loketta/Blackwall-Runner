"use strict";

const readline = require("readline");

function parseCommandLine(input) {
  const tokens = input
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return {
    command: tokens[0] ?? "",
    args: tokens.slice(1)
  };
}

function createInteractiveCli({
  handleCommand,
  applicationServices,
  input = process.stdin,
  output = process.stdout,
  log = console.log,
  clearTerminal = console.clear,
  getPrompt = () => "> ",
  createInterface = readline.createInterface
}) {
  if (typeof handleCommand !== "function") {
    throw new TypeError(
      "handleCommand must be a function."
    );
  }

  if (
    !applicationServices ||
    typeof applicationServices !== "object"
  ) {
    throw new TypeError(
      "applicationServices must be an object."
    );
  }

  if (typeof clearTerminal !== "function") {
    throw new TypeError(
      "clearTerminal must be a function."
    );
  }

  if (typeof getPrompt !== "function") {
    throw new TypeError(
      "getPrompt must be a function."
    );
  }

  if (typeof createInterface !== "function") {
    throw new TypeError(
      "createInterface must be a function."
    );
  }

  const interfaceInstance = createInterface({
    input,
    output,
    prompt: "> ",
    historySize: 100,
    removeHistoryDuplicates: true
  });

  function showPrompt() {
    let prompt = "> ";

    try {
      const resolvedPrompt = getPrompt();

      if (
        typeof resolvedPrompt === "string" &&
        resolvedPrompt.length > 0
      ) {
        prompt = resolvedPrompt;
      }
    } catch (error) {
      prompt = "> ";
    }

    if (
      typeof interfaceInstance.setPrompt ===
      "function"
    ) {
      interfaceInstance.setPrompt(prompt);
    }

    interfaceInstance.prompt();
  }

  async function processLine(line) {
    const { command, args } = parseCommandLine(line);

    if (!command) {
      showPrompt();
      return;
    }

    const normalisedCommand = command.toLowerCase();

    if (
      normalisedCommand === "quit" ||
      normalisedCommand === "exit"
    ) {
      interfaceInstance.close();
      return;
    }

    if (normalisedCommand === "clear") {
      clearTerminal();
      showPrompt();
      return;
    }

    if (normalisedCommand === "help") {
      await handleCommand(
        "unknown",
        [],
        {
          ...applicationServices,
          log
        }
      );

      showPrompt();
      return;
    }

    try {
      await handleCommand(
        normalisedCommand,
        args,
        {
          ...applicationServices,
          log
        }
      );
    } catch (error) {
      log(`Command failed: ${error.message}`);
    }

    showPrompt();
  }

  function start() {
    log("Blackwall Runner");
    log("Type 'help' for commands.");
    log("Type 'quit' to exit.");
    log("");

    interfaceInstance.on(
      "line",
      processLine
    );

    interfaceInstance.on(
      "close",
      function () {
        log("Goodbye.");
      }
    );

    showPrompt();

    return interfaceInstance;
  }

  return Object.freeze({
    start,
    processLine
  });
}

module.exports = {
  createInteractiveCli,
  parseCommandLine
};