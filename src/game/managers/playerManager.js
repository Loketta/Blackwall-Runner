const fs = require("fs");

const savePath = "data/players/runner.json";

function loadPlayer() {
    const playerData = fs.readFileSync(savePath, "utf8");
    return JSON.parse(playerData);
}

function savePlayer(player) {
    const updatedPlayerData = JSON.stringify(player, null, 4);
    fs.writeFileSync(savePath, updatedPlayerData);
}

module.exports = {
    loadPlayer,
    savePlayer
};