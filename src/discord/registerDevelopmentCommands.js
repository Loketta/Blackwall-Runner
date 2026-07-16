"use strict";

const {
  REST,
  Routes,
  SlashCommandBuilder
} = require("discord.js");

const {
  loadDiscordRuntimeConfig
} = require(
  "./discordRuntimeConfig"
);

const CREATE_CHARACTER_COMMAND =
  Object.freeze(
    new SlashCommandBuilder()
      .setName("create-character")
      .setDescription(
        "Start or resume Blackwall Runner character creation."
      )
      .toJSON()
  );

const DEVELOPMENT_COMMANDS =
  Object.freeze([
    CREATE_CHARACTER_COMMAND
  ]);

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

async function registerDevelopmentCommands({
  environment = process.env,
  loadConfig =
    loadDiscordRuntimeConfig,

  createRestClient = () =>
    new REST({
      version: "10"
    }),

  createRoute =
    Routes.applicationGuildCommands,

  commands =
    DEVELOPMENT_COMMANDS,

  logger = console
} = {}) {
  const configLoader =
    requireFunction(
      loadConfig,
      "loadConfig"
    );

  const restClientFactory =
    requireFunction(
      createRestClient,
      "createRestClient"
    );

  const routeFactory =
    requireFunction(
      createRoute,
      "createRoute"
    );

  if (!Array.isArray(commands)) {
    throw new TypeError(
      "commands must be an array"
    );
  }

  const runtimeLogger =
    requireObject(
      logger,
      "logger"
    );

  requireFunction(
    runtimeLogger.log,
    "logger.log"
  );

  const config =
    requireObject(
      configLoader(environment),
      "loadConfig result"
    );

  const restClient =
    requireObject(
      restClientFactory(),
      "createRestClient result"
    );

  requireFunction(
    restClient.setToken,
    "restClient.setToken"
  );

  requireFunction(
    restClient.put,
    "restClient.put"
  );

  const authenticatedClient =
    restClient.setToken(
      config.token
    );

  const client =
    authenticatedClient &&
    typeof authenticatedClient ===
      "object"
      ? authenticatedClient
      : restClient;

  requireFunction(
    client.put,
    "authenticated REST client put"
  );

  const route =
    routeFactory(
      config.applicationId,
      config.guildId
    );

  runtimeLogger.log(
    "Registering Discord development commands..."
  );

  const result =
    await client.put(
      route,
      {
        body: commands.map(
          (command) => ({
            ...command
          })
        )
      }
    );

  runtimeLogger.log(
    `Registered ${commands.length} Discord development command(s).`
  );

  return Object.freeze({
    route,
    commands: commands.map(
      (command) =>
        Object.freeze({
          ...command
        })
    ),
    result
  });
}

async function main() {
  return registerDevelopmentCommands();
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
  CREATE_CHARACTER_COMMAND,
  DEVELOPMENT_COMMANDS,
  main,
  registerDevelopmentCommands
};