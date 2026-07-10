const { describeLocation } = require("../../game/presentation/locationDescriber");
const { performAction } = require("../../game/dispatcher/actionDispatcher");

function runMoveCommand(player, args) {
    const exitName = args[0];

    const result = performAction(player, {
        type: "move",
        exit: exitName
    });

    console.log(result.message);

    if (result.success) {
        console.log("");
        describeLocation(result.data.location);
    }
}

module.exports = {
    runMoveCommand
};