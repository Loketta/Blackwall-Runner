"use strict";

const {
  Events
} = require("discord.js");

const {
  loadDiscordRuntimeConfig
} = require(
  "./discordRuntimeConfig"
);

const {
  createDiscordClient
} = require(
  "./createDiscordClient"
);

const {
  createDiscordCharacterCreationService
} = require(
  "./characterCreation/createDiscordCharacterCreationService"
);

function requireObject(
  value,
  name
) {
  if (
    !value ||
    typeof value !== "object"
  ) {
    throw new TypeError(
      `${name} must be an object`
    );
  }

  return value;
}

function requireFunction(
  value,
  name
) {
  if (typeof value !== "function") {
    throw new TypeError(
      `${name} must be a function`
    );
  }

  return value;
}

async function startDiscordBot({
  environment = process.env,
  loadConfig =
    loadDiscordRuntimeConfig,
  createService =
    createDiscordCharacterCreationService,
  createClient =
    createDiscordClient,
  logger = console
} = {}) {
  const configLoader =
    requireFunction(
      loadConfig,
      "loadConfig"
    );

  const serviceFactory =
    requireFunction(
      createService,
      "createService"
    );

  const clientFactory =
    requireFunction(
      createClient,
      "createClient"
    );

  const runtimeLogger =
    requireObject(
      logger,
      "logger"
    );

  requireFunction(
    runtimeLogger.log,
    "logger.log"
  );

  requireFunction(
    runtimeLogger.error,
    "logger.error"
  );

  const config =
    requireObject(
      configLoader(environment),
      "loadConfig result"
    );

  const service =
    requireObject(
      serviceFactory({
        savesDirectory:
          config.savesDirectory,
        worldId:
          config.worldId,
        startingLocation:
          config.startingLocation,
        startingCredits:
          config.startingCredits,
        startingInventory:
          config.startingInventory
      }),
      "createService result"
    );

  const router =
    requireObject(
      service.router,
      "service.router"
    );

  const client =
    requireObject(
      clientFactory({
        router,
        logger: runtimeLogger
      }),
      "createClient result"
    );

  requireFunction(
    client.once,
    "client.once"
  );

  requireFunction(
    client.login,
    "client.login"
  );

  client.once(
    Events.ClientReady,
    (readyClient) => {
      const username =
        readyClient &&
        readyClient.user &&
        typeof readyClient.user.tag ===
          "string"
          ? readyClient.user.tag
          : "unknown user";

      runtimeLogger.log(
        `Logged in as ${username}`
      );

      runtimeLogger.log(
        "Listening for Discord interactions."
      );
    }
  );

  runtimeLogger.log(
    "Connecting to Discord..."
  );

  await client.login(
    config.token
  );

  return Object.freeze({
    client,
    service,
    config
  });
}

async function main() {
  return startDiscordBot();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(
      `${error.name}: ${error.message}`
    );

    process.exitCode = 1;
  });
}

module.exports = {
  main,
  startDiscordBot
};