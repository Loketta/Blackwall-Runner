"use strict";

const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

function recordItemTransferredEvent({
  context,
  world,
  itemId,
  fromEntityId,
  toEntityId,
  quantity = 1,
  source
}) {
  const eventRecorder = context.services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "ItemTransferred",
    worldTime: formatWorldTime(world),
    actorId: context.player.id,
    targetIds: [
      itemId,
      fromEntityId,
      toEntityId
    ],
    locationId:
      context.player.locationId ??
      context.player.location ??
      null,
    payload: {
      itemId,
      fromEntityId,
      toEntityId,
      quantity
    },
    metadata: {
      source
    }
  });
}

module.exports = {
  recordItemTransferredEvent
};
