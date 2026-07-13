"use strict";

const {
  loadPlayer
} = require("../game/managers/playerManager");

const {
  runStatusCommand
} = require("./handlers/statusCommand");
const {
  runLookCommand
} = require("./handlers/lookCommand");
const {
  runMoveCommand
} = require("./handlers/moveCommand");
const {
  runWaitCommand
} = require("./handlers/waitCommand");
const {
  runInventoryCommand
} = require("./handlers/inventoryCommand");
const {
  runTakeCommand
} = require("./handlers/takeCommand");
const {
  runDropCommand
} = require("./handlers/dropCommand");
const {
  runTalkCommand
} = require("./handlers/talkCommand");
const {
  runShopCommand
} = require("./handlers/shopCommand");
const {
  runOpenCommand
} = require("./handlers/openCommand");

function showHelp() {
  console.log("Unknown command.");
  console.log("Available commands:");
  console.log("status");
  console.log("look");
  console.log("move <exit>");
  console.log("wait <minutes>");
  console.log("inventory");
  console.log("take <item>");
  console.log("take <item> from <container>");
  console.log("drop <item>");
  console.log("drop <item> into <container>");
  console.log("talk <person>");
  console.log("shop");
  console.log("open <container>");
}

async function handleCommand(command, args) {
  const player = loadPlayer();

  if (command === "status") {
    await runStatusCommand(player);
    return;
  }

  if (command === "look") {
    await runLookCommand(player);
    return;
  }

  if (command === "move" || command === "go") {
    await runMoveCommand(player, args);
    return;
  }

  if (command === "wait") {
    await runWaitCommand(player, args);
    return;
  }

  if (command === "inventory") {
    await runInventoryCommand(player);
    return;
  }

  if (command === "take") {
    await runTakeCommand(player, args);
    return;
  }

  if (command === "drop") {
    await runDropCommand(player, args);
    return;
  }

  if (command === "talk") {
    await runTalkCommand(player, args);
    return;
  }

  if (command === "shop") {
    await runShopCommand(player);
    return;
  }

  if (command === "open") {
    await runOpenCommand(player, args);
    return;
  }

  showHelp();
}

module.exports = {
  handleCommand
};
