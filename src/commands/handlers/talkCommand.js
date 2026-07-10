const { performAction } = require("../../game/dispatcher/actionDispatcher");

function runTalkCommand(player, args) {
    const npcInput = args.join(" ");

    const result = performAction(player, {
        type: "talk",
        npcInput: npcInput
    });

    console.log(result.message);
}

module.exports = {
    runTalkCommand
};