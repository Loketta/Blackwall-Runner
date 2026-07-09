const { loadPlayer } = require("../game/playerManager");
const { runStatusCommand } = require("./handlers/statusCommand");
const { runLookCommand } = require("./handlers/lookCommand");
const { runMoveCommand } = require("./handlers/moveCommand");
const { runWaitCommand } = require("./handlers/waitCommand");
const { runInventoryCommand } = require("./handlers/inventoryCommand");
const { runTakeCommand } = require("./handlers/takeCommand");
const { runDropCommand } = require("./handlers/dropCommand");
const { runTalkCommand } = require("./handlers/talkCommand");
const { runShopCommand } = require("./handlers/shopCommand");

function showHelp() {
    console.log("Unknown command.");
    console.log("Available commands:");
    console.log("status");
    console.log("look");
    console.log("move <exit>");
    console.log("wait <minutes>");
    console.log("inventory");
    console.log("take <item>");
    console.log("drop <item>");
    console.log("talk <npc>");
    console.log("shop");
}

function handleCommand(command, args) {
    const player = loadPlayer();

    if (command === "status") {
        runStatusCommand(player);
        return;
    }

    if (command === "look") {
        runLookCommand(player);
        return;
    }

    if (command === "move" || command === "go") {
        runMoveCommand(player, args);
        return;
    }

    if (command === "wait") {
        runWaitCommand(player, args);
        return;
    }

    if (command === "inventory") {
        runInventoryCommand(player);
        return;
    }

    if (command === "take") {
        runTakeCommand(player, args);
        return;
    }

    if (command === "drop") {
        runDropCommand(player, args);
        return;
    }

    if (command === "talk") {
        runTalkCommand(player, args);
        return;
    }

    if (command === "shop") {
        runShopCommand(player);
        return;
    }

    showHelp();
}

module.exports = {
    handleCommand
};