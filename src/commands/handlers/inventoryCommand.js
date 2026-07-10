const { performAction } = require("../../game/actionDispatcher");

function runInventoryCommand(player) {
    const result = performAction(player, {
        type: "inventory"
    });

    console.log("=== INVENTORY ===");

    if (result.data.inventory.length === 0) {
        console.log("Your inventory is empty.");
    } else {
        for (const item of result.data.inventory) {
            console.log(`- ${item.name}`);
        }
    }
}

module.exports = {
    runInventoryCommand
};