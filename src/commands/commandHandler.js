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

function showHelp(log = console.log) {
  log("Unknown command.");
  log("Available commands:");
  log("status");
  log("look");
  log("move <exit>");
  log("wait <minutes>");
  log("inventory");
  log("take <item>");
  log("take <item> from <container>");
  log("drop <item>");
  log("drop <item> into <container>");
  log("talk <person>");
  log("shop");
  log("open <container>");
}

async function handleCommand(
  command,
  args,
  services = {}
) {
  const loadPlayerService =
    services.loadPlayer ?? loadPlayer;

  const player = loadPlayerService();

  const commandServices = {
    presentationPipeline:
      services.presentationPipeline
  };

  if (command === "status") {
    await runStatusCommand(
      player,
      commandServices
    );
    return;
  }

  if (command === "look") {
    await runLookCommand(
      player,
      commandServices
    );
    return;
  }

  if (command === "move" || command === "go") {
    await runMoveCommand(
      player,
      args,
      commandServices
    );
    return;
  }

  if (command === "wait") {
    await runWaitCommand(player, args);
    return;
  }

  if (command === "inventory") {
    await runInventoryCommand(
      player,
      commandServices
    );
    return;
  }

  if (command === "take") {
    await runTakeCommand(
      player,
      args,
      commandServices
    );
    return;
  }

  if (command === "drop") {
    await runDropCommand(
      player,
      args,
      commandServices
    );
    return;
  }

  if (command === "talk") {
    await runTalkCommand(
      player,
      args,
      commandServices
    );
    return;
  }

  if (command === "shop") {
    await runShopCommand(player);
    return;
  }

  if (command === "open") {
    await runOpenCommand(
      player,
      args,
      commandServices
    );
    return;
  }

  showHelp(services.log ?? console.log);
}

module.exports = {
  handleCommand,
  showHelp
};
