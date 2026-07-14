"use strict";

const {
  createApplicationServices
} = require("./application/applicationServices");
const {
  handleCommand
} = require("./commands/commandHandler");

const command = process.argv[2];
const args = process.argv.slice(3);

const applicationServices =
  createApplicationServices();

handleCommand(
  command,
  args,
  applicationServices
).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
