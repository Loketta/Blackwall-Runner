const { performAction } = require("../../game/actionDispatcher");

function runDropCommand(player, args) {
    const itemInput = args.join(" ");

    const result = performAction(player, {
        type: "drop",
        itemInput: itemInput
    });

    console.log(result.message);
}

module.exports = {
    runDropCommand
};