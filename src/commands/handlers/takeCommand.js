const { performAction } = require("../../game/dispatcher/actionDispatcher");

function runTakeCommand(player, args) {
  const fromIndex = args.findIndex(function (arg) {
    return arg.toLowerCase() === "from";
  });

  if (fromIndex === -1) {
    const itemInput = args.join(" ").trim();

    const result = performAction(player, {
      type: "take",
      itemInput
    });

    console.log(result.message);
    return;
  }

  const itemInput = args.slice(0, fromIndex).join(" ").trim();
  const containerInput = args.slice(fromIndex + 1).join(" ").trim();

  if (!itemInput || !containerInput) {
    console.log("Use: take <item> from <container>");
    return;
  }

  const result = performAction(player, {
    type: "takeFromContainer",
    itemInput,
    containerInput
  });

  console.log(result.message);
}

module.exports = {
  runTakeCommand
};