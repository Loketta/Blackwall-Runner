"use strict";

const {
  loadWorld
} = require("../managers/worldManager");
const {
  ActionResult
} = require("../results/actionResult");

function performStatusAction(context) {
  const loadWorldService =
    context.services.loadWorld ?? loadWorld;

  const world = loadWorldService();

  return ActionResult.success(
    "You check your status.",
    {
      status: {
        name: context.player.name,
        role: context.player.role,
        health: context.player.health,
        credits: context.player.credits,
        location: context.player.location
      },
      world
    }
  );
}

module.exports = {
  performStatusAction
};
