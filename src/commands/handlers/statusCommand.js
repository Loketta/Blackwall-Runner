const { loadWorld } = require("../../game/managers/worldManager");

function runStatusCommand(player) {
    const world = loadWorld();

    console.log("=== PLAYER STATUS ===");
    console.log(`Name: ${player.name}`);
    console.log(`Role: ${player.role}`);
    console.log(`Health: ${player.health}`);
    console.log(`Credits: ${player.credits}`);
    console.log(`Location: ${player.location}`);
    console.log(`Day: ${world.day}`);
    console.log(`Time: ${world.currentTime}`);
    console.log(`Weather: ${world.weather}`);
}

module.exports = {
    runStatusCommand
};