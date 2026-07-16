"use strict";

const {
  createCharacterCreationApplication
} = require(
  "../../application/createCharacterCreationApplication"
);

const {
  createDiscordCharacterCreationPayload,
  createNameModal
} = require(
  "./discordCharacterCreationView"
);

const {
  createDiscordCharacterCreationSession
} = require(
  "./discordCharacterCreationSession"
);

const {
  createDiscordCharacterCreationSessionRegistry
} = require(
  "./discordCharacterCreationSessionRegistry"
);

const {
  createDiscordCharacterCreationRouter
} = require(
  "./discordCharacterCreationRouter"
);

function requireNonEmptyString(
  value,
  name
) {
  if (
    typeof value !== "string" ||
    value.trim() === ""
  ) {
    throw new TypeError(
      `${name} must be a non-empty string`
    );
  }

  return value.trim();
}

function requireFiniteNumber(
  value,
  name
) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    throw new TypeError(
      `${name} must be a finite number`
    );
  }

  return value;
}

function requireArray(
  value,
  name
) {
  if (!Array.isArray(value)) {
    throw new TypeError(
      `${name} must be an array`
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

function createDiscordCharacterCreationService({
  savesDirectory,
  worldId,
  startingLocation,
  startingCredits = 0,
  startingInventory = [],

  createApplication =
    createCharacterCreationApplication,

  createSession =
    createDiscordCharacterCreationSession,

  createRegistry =
    createDiscordCharacterCreationSessionRegistry,

  createRouter =
    createDiscordCharacterCreationRouter,

  renderView =
    createDiscordCharacterCreationPayload,

  createModal =
    createNameModal
}) {
  const resolvedSavesDirectory =
    requireNonEmptyString(
      savesDirectory,
      "savesDirectory"
    );

  const resolvedWorldId =
    requireNonEmptyString(
      worldId,
      "worldId"
    );

  const resolvedStartingLocation =
    requireNonEmptyString(
      startingLocation,
      "startingLocation"
    );

  const resolvedStartingCredits =
    requireFiniteNumber(
      startingCredits,
      "startingCredits"
    );

  const resolvedStartingInventory =
    requireArray(
      startingInventory,
      "startingInventory"
    ).slice();

  const applicationFactory =
    requireFunction(
      createApplication,
      "createApplication"
    );

  const sessionFactory =
    requireFunction(
      createSession,
      "createSession"
    );

  const registryFactory =
    requireFunction(
      createRegistry,
      "createRegistry"
    );

  const routerFactory =
    requireFunction(
      createRouter,
      "createRouter"
    );

  const payloadRenderer =
    requireFunction(
      renderView,
      "renderView"
    );

  const modalFactory =
    requireFunction(
      createModal,
      "createModal"
    );

  const application =
    requireObject(
      applicationFactory({
        savesDirectory:
          resolvedSavesDirectory,
        worldId:
          resolvedWorldId
      }),
      "createApplication result"
    );

  const sessionRegistry =
    requireObject(
      registryFactory({
        createSession(identity) {
          requireObject(
            identity,
            "identity"
          );

          return sessionFactory({
            application,
            startingLocation:
              resolvedStartingLocation,
            startingCredits:
              resolvedStartingCredits,
            startingInventory:
              resolvedStartingInventory
                .slice()
          });
        }
      }),
      "createRegistry result"
    );

  const router =
    requireObject(
      routerFactory({
        sessionRegistry,
        renderView:
          payloadRenderer,
        createNameModal:
          modalFactory
      }),
      "createRouter result"
    );

  return Object.freeze({
    application,
    sessionRegistry,
    router
  });
}

module.exports = {
  createDiscordCharacterCreationService
};