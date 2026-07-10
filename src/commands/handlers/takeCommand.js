const { performAction } = require("../../game/actionDispatcher");

function runTakeCommand(player, args) {
    const itemInput = args.join(" ");

    const result = performAction(player, {
        type: "take",
        itemInput: itemInput
    });

    console.log(result.message);
}

module.exports = {
    runTakeCommand
};