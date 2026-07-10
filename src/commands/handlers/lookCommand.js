const { describeLocation } = require("../../game/locationDescriber");
const { performAction } = require("../../game/actionDispatcher");

function runLookCommand(player) {
    const result = performAction(player, {
        type: "look"
    });

    if (result.success) {
        describeLocation(result.data.location);
    } else {
        console.log(result.message);
    }
}

module.exports = {
    runLookCommand
};