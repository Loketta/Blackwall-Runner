const { loadShopsAtLocation } = require("../../game/shopManager");
const { loadItem } = require("../../game/itemManager");

function runShopCommand(player) {
    const shops = loadShopsAtLocation(player.location);

    if (shops.length === 0) {
        console.log("There are no shops here.");
        return;
    }

    for (const shop of shops) {
        console.log(`=== ${shop.name} ===`);

        if (!shop.isOpen) {
            console.log("Closed.");
            continue;
        }

        if (!shop.stock || shop.stock.length === 0) {
            console.log("No stock available.");
            continue;
        }

        for (const stockItem of shop.stock) {
            const item = loadItem(stockItem.itemId);

            if (item) {
                console.log(`- ${item.name}: ${stockItem.price} credits`);
            } else {
                console.log(`- Unknown Item (${stockItem.itemId}): ${stockItem.price} credits`);
            }
        }
    }
}

module.exports = {
    runShopCommand
};