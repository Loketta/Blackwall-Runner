const {
  getInventory
} = require("../systems/inventorySystem");
const {
  ActionResult
} = require("../results/actionResult");

function performInventoryAction(context) {
  const inventory = getInventory(context.player);

  return ActionResult.success(
    "You check your inventory.",
    {
      inventory
    }
  );
}

module.exports = {
  performInventoryAction
};
