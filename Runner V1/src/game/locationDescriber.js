const { loadItem } = require("./itemManager");
const { loadNpc } = require("./npcManager");
const { loadShops } = require("./shopManager");

function describeLocation(location) {
    console.log(location.name);
    console.log(location.description);

    const shops = loadShops().filter(function(shop) {
        return shop.locationId === location.id;
    });

    if (shops.length > 0) {
        console.log("");
        console.log("Shops:");

        for (const shop of shops) {
            const status = shop.isOpen ? "Open" : "Closed";
            console.log(`- ${shop.name} (${status})`);
        }
    }

    if (location.npcs.length > 0) {
        console.log("");
        console.log("People:");

        for (const npcId of location.npcs) {
            const npc = loadNpc(npcId);

            if (npc) {
                console.log(`- ${npc.name}`);
            } else {
                console.log(`- Unknown NPC (${npcId})`);
            }
        }
    }

    if (location.items.length > 0) {
        console.log("");
        console.log("Items:");

        for (const itemId of location.items) {
            const item = loadItem(itemId);

            if (item) {
                console.log(`- ${item.name}`);
            } else {
                console.log(`- Unknown Item (${itemId})`);
            }
        }
    }

    if (location.exits.length > 0) {
        console.log("");
        console.log("Exits:");

        for (const exit of location.exits) {
            console.log(`- ${exit.name}: ${exit.description}`);
        }
    }
}

module.exports = {
    describeLocation
};