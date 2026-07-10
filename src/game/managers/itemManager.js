const fs = require("fs");
const path = require("path");

const itemsPath = path.join(__dirname, "../../../data/Items/items.json");

function loadItems() {
    const itemData = fs.readFileSync(itemsPath, "utf8");
    return JSON.parse(itemData);
}

function loadItem(itemId) {
    const items = loadItems();

    return items.find(function(item) {
        return item.id === itemId;
    });
}

module.exports = {
    loadItems,
    loadItem
};
