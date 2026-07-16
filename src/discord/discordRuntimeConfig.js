"use strict";

const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  quiet: true
});

const DEFAULT_WORLD_ID =
  "development-world";

const DEFAULT_STARTING_LOCATION =
  "back_alley_1";

const DEFAULT_STARTING_CREDITS = 0;

const DEFAULT_STARTING_INVENTORY =
  Object.freeze([]);

function readOptionalString(
  environment,
  fieldName
) {
  const value =
    environment[fieldName];

  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue =
    value.trim();

  return trimmedValue === ""
    ? null
    : trimmedValue;
}

function requireSetting(
  environment,
  fieldName
) {
  const value =
    readOptionalString(
      environment,
      fieldName
    );

  if (value === null) {
    throw new Error(
      `${fieldName} is required.`
    );
  }

  return value;
}

function loadDiscordRuntimeConfig(
  environment = process.env,
  {
    defaultSavesDirectory =
      path.resolve(
        __dirname,
        "../../saves"
      )
  } = {}
) {
  if (
    !environment ||
    typeof environment !== "object"
  ) {
    throw new TypeError(
      "environment must be an object."
    );
  }

  if (
    typeof defaultSavesDirectory !==
      "string" ||
    defaultSavesDirectory.trim() === ""
  ) {
    throw new TypeError(
      "defaultSavesDirectory must be a non-empty string."
    );
  }

  const token =
    requireSetting(
      environment,
      "DISCORD_TOKEN"
    );

  const applicationId =
    requireSetting(
      environment,
      "DISCORD_APPLICATION_ID"
    );

  const guildId =
    requireSetting(
      environment,
      "DISCORD_GUILD_ID"
    );

  const savesDirectory =
    readOptionalString(
      environment,
      "BLACKWALL_SAVES_DIRECTORY"
    ) ??
    defaultSavesDirectory.trim();

  const worldId =
    readOptionalString(
      environment,
      "BLACKWALL_WORLD_ID"
    ) ??
    DEFAULT_WORLD_ID;

  const startingLocation =
    readOptionalString(
      environment,
      "BLACKWALL_STARTING_LOCATION"
    ) ??
    DEFAULT_STARTING_LOCATION;

  return Object.freeze({
    token,
    applicationId,
    guildId,
    savesDirectory,
    worldId,
    startingLocation,
    startingCredits:
      DEFAULT_STARTING_CREDITS,
    startingInventory: [
      ...DEFAULT_STARTING_INVENTORY
    ]
  });
}

module.exports = {
  DEFAULT_STARTING_CREDITS,
  DEFAULT_STARTING_INVENTORY,
  DEFAULT_STARTING_LOCATION,
  DEFAULT_WORLD_ID,
  loadDiscordRuntimeConfig
};