const { performAction } = require("../../game/dispatcher/actionDispatcher");

function runDropCommand(player, args) {
  const intoIndex = args.findIndex(function (arg) {
    return arg.toLowerCase() === "into";
  });

  if (intoIndex === -1) {
    const itemInput = args.join(" ").trim();

    const result = performAction(player, {
      type: "drop",
      itemInput
    });

    console.log(result.message);
    return;
  }

  const itemInput = args.slice(0, intoIndex).join(" ").trim();
  const containerInput = args.slice(intoIndex + 1).join(" ").trim();

  if (!itemInput || !containerInput) {
    console.log("Use: drop <item> into <container>");
    return;
  }

  const result = performAction(player, {
    type: "dropIntoContainer",
    itemInput,
    containerInput
  });

  console.log(result.message);
}

module.exports = {
  runDropCommand
};