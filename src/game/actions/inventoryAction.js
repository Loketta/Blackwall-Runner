const { getInventory } = require("../systems/inventorySystem");

function performInventoryAction(player) {
  const inventory = getInventory(player);

  return {
    success: true,
    message: "You check your inventory.",
    data: {
      inventory
    }
  };
}

module.exports = {
  performInventoryAction
};
