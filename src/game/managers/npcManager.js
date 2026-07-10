const fs = require("fs");
const path = require("path");

const npcsPath = path.join(__dirname, "../../../data/npcs/npcs.json");

function loadNpcs() {
    const npcData = fs.readFileSync(npcsPath, "utf8");
    return JSON.parse(npcData);
}

function loadNpc(npcId) {
    const npcs = loadNpcs();

    return npcs.find(function(npc) {
        return npc.id === npcId;
    });
}

module.exports = {
    loadNpcs,
    loadNpc
};