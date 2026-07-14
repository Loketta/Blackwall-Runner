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

  if (typeof createInterface !== "function") {
    throw new TypeError(
      "createInterface must be a function."
    );
  }

  const interfaceInstance =
    createInterface({
      input,
      output,
      prompt: "> "
    });

  async function processLine(line) {
    const {
      command,
      args
    } = parseCommandLine(line);

    if (!command) {
      interfaceInstance.prompt();
      return;
    }

    const normalisedCommand =
      command.toLowerCase();

    if (
      normalisedCommand === "quit" ||
      normalisedCommand === "exit"
    ) {
      interfaceInstance.close();
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

      interfaceInstance.prompt();
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

    interfaceInstance.prompt();
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

    interfaceInstance.prompt();

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
