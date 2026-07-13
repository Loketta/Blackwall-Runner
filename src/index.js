"use strict";

const {
  handleCommand
} = require("./commands/commandHandler");

const command = process.argv[2];
const args = process.argv.slice(3);

handleCommand(command, args).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
