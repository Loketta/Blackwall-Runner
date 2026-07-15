"use strict";

const path = require("path");

const {
  createCharacterCreationApplication
} = require("../src/application/createCharacterCreationApplication");

const {
  createCharacterCreationCli
} = require("../src/cli/characterCreationCli");

const savesDirectory =
  process.env.BLACKWALL_SAVES_DIRECTORY ??
  path.join(__dirname, "../saves");

const worldId =
  process.env.BLACKWALL_WORLD_ID ??
  "development-world";

const ownerId =
  process.env.BLACKWALL_CHARACTER_OWNER ??
  "local-developer";

const application =
  createCharacterCreationApplication({
    savesDirectory,
    worldId
  });

const cli = createCharacterCreationCli({
  application,
  ownerId,
  platform: "cli",
  startingLocation: "back_alley_1",
  startingCredits: 0,
  startingInventory: []
});

cli.run();