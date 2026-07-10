const { performAction } = require("../../game/actionDispatcher");
const { loadItem } = require("../../game/managers/itemManager");

function runOpenCommand(player, args) {
  const containerInput = args.join(" ").trim();

  if (!containerInput) {
    console.log("What do you want to open?");
    return;
  }

  const result = performAction(player, {
    type: "open",
    containerInput
  });

  console.log(result.message);

  if (!result.success) {
    return;
  }

  const container = result.data.container;

  if (container.items.length === 0) {
    console.log("It is empty.");
    return;
  }

  console.log("");
  console.log("Contents:");

  for (const itemId of container.items) {
    const item = loadItem(itemId);

    if (item) {
      console.log(`- ${item.name}`);
    } else {
      console.log(`- Unknown Item (${itemId})`);
    }
  }
}

module.exports = {
  runOpenCommand
};