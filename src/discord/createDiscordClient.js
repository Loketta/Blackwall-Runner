"use strict";

const {
  Client,
  Events,
  GatewayIntentBits
} = require("discord.js");

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

function createDiscordClient({
  router,
  createClient = (options) =>
    new Client(options),
  logger = console
}) {
  const interactionRouter =
    requireObject(
      router,
      "router"
    );

  requireFunction(
    interactionRouter.route,
    "router.route"
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
    runtimeLogger.error,
    "logger.error"
  );

  const client =
    requireObject(
      clientFactory({
        intents: [
          GatewayIntentBits.Guilds
        ]
      }),
      "createClient result"
    );

  requireFunction(
    client.on,
    "client.on"
  );

  client.on(
    Events.InteractionCreate,
    async (interaction) => {
      try {
        await interactionRouter.route(
          interaction
        );
      } catch (error) {
        runtimeLogger.error(
          "Discord interaction routing failed.",
          error
        );
      }
    }
  );

  return client;
}

module.exports = {
  createDiscordClient
};