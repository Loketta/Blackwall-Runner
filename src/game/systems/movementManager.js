const { loadLocation } = require("../managers/locationManager");
const { savePlayer } = require("../managers/playerManager");

function movePlayer(player, exitName) {
    const currentLocation = loadLocation(player.location);

    const chosenExit = currentLocation.exits.find((exit) => {
        return exit.name === exitName;
    });

    if (!chosenExit) {
        return null;
    }

    player.location = chosenExit.destination;
    savePlayer(player);

    const newLocation = loadLocation(player.location);

    return newLocation;
}

module.exports = {
    movePlayer
};