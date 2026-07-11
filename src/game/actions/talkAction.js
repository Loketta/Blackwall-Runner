const {
  loadLocation
} = require("../managers/locationManager");
const {
  resolveNpc
} = require("../resolution/entityResolver");

function performTalkAction(context) {
  const npc = resolveNpc(context.action.npcInput);

  if (!npc) {
    return {
      success: false,
      message: "I do not recognise that person.",
      data: {}
    };
  }

  const location = loadLocation(context.player.location);
  const npcIds = location.npcs || [];

  if (!npcIds.includes(npc.id)) {
    return {
      success: false,
      message: "That person is not here.",
      data: {}
    };
  }

  return {
    success: true,
    message: npc.dialogue,
    data: {
      npc
    }
  };
}

module.exports = {
  performTalkAction
};
