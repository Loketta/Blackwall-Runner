const { handleCommand } = require("./commands/commandHandler");

const command = process.argv[2];
const args = process.argv.slice(3);

handleCommand(command, args);