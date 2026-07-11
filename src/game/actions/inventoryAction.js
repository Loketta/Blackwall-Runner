const {
  getInventory
} = require("../systems/inventorySystem");

function performInventoryAction(context) {
  const inventory = getInventory(context.player);

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
