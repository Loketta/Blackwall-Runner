"use strict";

const path = require("path");
const readline = require("readline");

const {
  createCharacterCreationApplication
} = require(
  "../application/createCharacterCreationApplication"
);

const {
  createCharacterCreationController
} = require(
  "../game/characterCreation/characterCreationController"
);

const {
  createCharacterCreationRenderer
} = require(
  "./characterCreationRenderer"
);

const DEFAULT_WORLD_ID = "development-world";
const DEFAULT_OWNER_ID = "local-player";
const DEFAULT_STARTING_LOCATION =
  "back_alley_1";
const DEFAULT_STARTING_CREDITS = 0;
const DEFAULT_STARTING_INVENTORY =
  Object.freeze([]);
const PLATFORM = "cli";

function createTerminalInterface({
  input = process.stdin,
  output = process.stdout
} = {}) {
  const interfaceInstance =
    readline.createInterface({
      input,
      output
    });

  function readInput(prompt = "") {
    return new Promise((resolve) => {
      interfaceInstance.question(
        prompt,
        resolve
      );
    });
  }

  function writeOutput(message = "") {
    output.write(`${message}\n`);
  }

  function close() {
    interfaceInstance.close();
  }

  return Object.freeze({
    readInput,
    writeOutput,
    close
  });
}

function createCliController({
  controller,
  startingLocation =
    DEFAULT_STARTING_LOCATION,
  startingCredits =
    DEFAULT_STARTING_CREDITS,
  startingInventory =
    DEFAULT_STARTING_INVENTORY
}) {
  if (
    !controller ||
    typeof controller !== "object"
  ) {
    throw new TypeError(
      "controller must be an object."
    );
  }

  if (
    typeof startingLocation !== "string" ||
    startingLocation.trim() === ""
  ) {
    throw new TypeError(
      "startingLocation must be a non-empty string."
    );
  }

  if (
    !Number.isFinite(startingCredits)
  ) {
    throw new TypeError(
      "startingCredits must be a finite number."
    );
  }

  if (!Array.isArray(startingInventory)) {
    throw new TypeError(
      "startingInventory must be an array."
    );
  }

  return Object.freeze({
    start: controller.start,
    submit: controller.submit,
    next: controller.next,
    previous: controller.previous,
    renderCurrentStep:
      controller.renderCurrentStep,
    cancel: controller.cancel,
    isActive: controller.isActive,

    finalise() {
      return controller.finalise({
        startingLocation:
          startingLocation.trim(),
        startingCredits,
        startingInventory: [
          ...startingInventory
        ]
      });
    }
  });
}

async function main() {
  const savesDirectory = path.resolve(
    __dirname,
    "../../saves"
  );

  const worldId =
    process.env.BLACKWALL_WORLD_ID ??
    DEFAULT_WORLD_ID;

  const ownerId =
    process.env.BLACKWALL_OWNER_ID ??
    DEFAULT_OWNER_ID;

  const startingLocation =
    process.env.BLACKWALL_STARTING_LOCATION ??
    DEFAULT_STARTING_LOCATION;

  const application =
    createCharacterCreationApplication({
      savesDirectory,
      worldId
    });

  const controller =
    createCharacterCreationController({
      application
    });

  const cliController =
    createCliController({
      controller,
      startingLocation
    });

  const terminal =
    createTerminalInterface();

  const renderer =
    createCharacterCreationRenderer({
      controller: cliController,
      readInput: terminal.readInput,
      writeOutput: terminal.writeOutput
    });

  try {
    await renderer.run({
      ownerId,
      platform: PLATFORM
    });
  } finally {
    terminal.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `${error.name}: ${error.message}`
    );

    process.exitCode = 1;
  });
}

module.exports = {
  DEFAULT_WORLD_ID,
  DEFAULT_OWNER_ID,
  DEFAULT_STARTING_LOCATION,
  DEFAULT_STARTING_CREDITS,
  DEFAULT_STARTING_INVENTORY,
  PLATFORM,
  createTerminalInterface,
  createCliController,
  main
};