const {
  loadLocation
} = require("../managers/locationManager");
const {
  resolveNpc
} = require("../resolution/entityResolver");
const {
  ActionResult
} = require("../results/actionResult");

function performTalkAction(context) {
  const npc = resolveNpc(context.action.npcInput);

  if (!npc) {
    return ActionResult.failure(
      "I do not recognise that person."
    );
  }

  const location = loadLocation(context.player.location);
  const npcIds = location.npcs || [];

  if (!npcIds.includes(npc.id)) {
    return ActionResult.failure(
      "That person is not here."
    );
  }

  return ActionResult.success(
    npc.dialogue,
    {
      npc
    }
  );
}

module.exports = {
  performTalkAction
};
