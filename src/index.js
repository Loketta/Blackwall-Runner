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

const command = process.argv[2];
const args = process.argv.slice(3);

const applicationServices =
  createApplicationServices();

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
      applicationServices
    });

  interactiveCli.start();
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
