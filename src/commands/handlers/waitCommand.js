"use strict";

const { performAction } = require(
  "../../game/dispatcher/actionDispatcher"
);
const { getEventServices } = require(
  "../../game/events/eventServices"
);
const { presentEvent } = require(
  "../../game/presentation/eventPresenter"
);

function runWaitCommand(player, args) {
  const minutes = Number(args[0]);
  const result = performAction(
    player,
    {
      type: "wait",
      minutes
    },
    getEventServices()
  );

  console.log(result.message);

  if (!result.success) {
    return;
  }

  console.log(`Day: ${result.data.world.day}`);
  console.log(`Time: ${result.data.world.currentTime}`);

  if (!result.data.events || result.data.events.length === 0) {
    return;
  }

  for (const event of result.data.events) {
    if (!event.locationId || event.locationId === player.location) {
      console.log("");
      console.log(presentEvent(event));
    }
  }
}

module.exports = {
  runWaitCommand
};
