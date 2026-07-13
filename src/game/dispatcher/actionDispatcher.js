"use strict";

const {
  ActionContext
} = require("../context/actionContext");
const {
  ActionResult
} = require("../results/actionResult");
const {
  performWaitAction
} = require("../actions/waitAction");
const {
  performLookAction
} = require("../actions/lookAction");
const {
  performInventoryAction
} = require("../actions/inventoryAction");
const {
  performStatusAction
} = require("../actions/statusAction");
const {
  performMoveAction
} = require("../actions/moveAction");
const {
  performTakeAction
} = require("../actions/takeAction");
const {
  performTalkAction
} = require("../actions/talkAction");
const {
  performOpenContainerAction
} = require("../actions/openContainerAction");
const {
  performTakeFromContainerAction
} = require("../actions/takeFromContainerAction");
const {
  performDropAction
} = require("../actions/dropAction");
const {
  performDropIntoContainerAction
} = require("../actions/dropIntoContainerAction");

function performAction(player, action, services = {}) {
  const context = new ActionContext({
    player,
    action,
    services
  });

  if (action.type === "look") {
    return performLookAction(context);
  }

  if (action.type === "move") {
    return performMoveAction(context);
  }

  if (action.type === "wait") {
    return performWaitAction(context);
  }

  if (action.type === "inventory") {
    return performInventoryAction(context);
  }

  if (action.type === "status") {
    return performStatusAction(context);
  }

  if (action.type === "take") {
    return performTakeAction(context);
  }

  if (action.type === "drop") {
    return performDropAction(context);
  }

  if (action.type === "talk") {
    return performTalkAction(context);
  }

  if (action.type === "open") {
    return performOpenContainerAction(context);
  }

  if (action.type === "takeFromContainer") {
    return performTakeFromContainerAction(context);
  }

  if (action.type === "dropIntoContainer") {
    return performDropIntoContainerAction(context);
  }

  return ActionResult.failure("Unknown action.");
}

module.exports = {
  performAction
};
