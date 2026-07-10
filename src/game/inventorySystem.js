const { loadItem } = require("./managers/itemManager");

function addItem(player, itemId) {
    player.inventory.push(itemId);
}

function removeItem(player, itemId) {
    const index = player.inventory.indexOf(itemId);

    if (index === -1) {
        return false;
    }

    player.inventory.splice(index, 1);

    return true;
}

function hasItem(player, itemId) {
    return player.inventory.includes(itemId);
}

function getInventory(player) {
    const inventory = [];

    for (const itemId of player.inventory) {
        const item = loadItem(itemId);

        if (item) {
            inventory.push(item);
        }
    }

    return inventory;
}

module.exports = {
    addItem,
    removeItem,
    hasItem,
    getInventory
};