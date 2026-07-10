const fs = require("fs");
const path = require("path");

const worldPath = path.join(__dirname, "../../../data/World/world.json");

function loadWorld() {
    const worldData = fs.readFileSync(worldPath, "utf8");
    return JSON.parse(worldData);
}

function saveWorld(world) {
    const worldData = JSON.stringify(world, null, 2);
    fs.writeFileSync(worldPath, worldData);
}

module.exports = {
    loadWorld,
    saveWorld
};
