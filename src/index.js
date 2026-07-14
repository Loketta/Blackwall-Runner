"use strict";

const {
  createApplicationServices
} = require("./application/applicationServices");
const {
  createInteractiveCli
} = require("./application/interactiveCli");
const {
  handleCommand
} = require("./commands/commandHandler");
const {
  loadPlayer
} = require("./game/managers/playerManager");
const {
  loadLocation
} = require("./game/managers/locationManager");

const command = process.argv[2];
const args = process.argv.slice(3);

const applicationServices =
  createApplicationServices();

function getInteractivePrompt() {
  const player = loadPlayer();
  const location = loadLocation(
    player.location
  );

  const locationName =
    location?.name ??
    player.location ??
    "Unknown Location";

  return `[${locationName}] > `;
}

async function run() {
  if (command) {
    await handleCommand(
      command,
      args,
      applicationServices
    );

    return;
  }

  const interactiveCli =
    createInteractiveCli({
      handleCommand,
      applicationServices,
      getPrompt: getInteractivePrompt
    });

  interactiveCli.start();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});