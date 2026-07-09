const { loadItems } = require("./itemManager");
const { loadNpcs } = require("./npcManager");

function resolveItem(input) {
    const items = loadItems();

    const search = input.toLowerCase();

    return items.find(item =>
        item.id.toLowerCase() === search ||
        item.name.toLowerCase() === search
    );
}

function resolveNpc(input) {
    const npcs = loadNpcs();

    const search = input.toLowerCase();

    return npcs.find(npc =>
        npc.id.toLowerCase() === search ||
        npc.name.toLowerCase() === search
    );
}

module.exports = {
    resolveItem,
    resolveNpc
};