"use strict";

const assert = require("assert");

const {
  createDiscordCharacterCreationService
} = require(
  "../../src/discord/characterCreation/createDiscordCharacterCreationService"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createHarness() {
  const calls = [];

  const application = {
    id: "application-1"
  };

  const session = {
    id: "session-1"
  };

  const registry = {
    id: "registry-1"
  };

  const router = {
    id: "router-1"
  };

  function createApplication(input) {
    calls.push({
      method: "createApplication",
      input
    });

    return application;
  }

  function createSession(input) {
    calls.push({
      method: "createSession",
      input
    });

    return session;
  }

  function createRegistry(input) {
    calls.push({
      method: "createRegistry",
      input
    });

    registry.createSession =
      input.createSession;

    return registry;
  }

  function createRouter(input) {
    calls.push({
      method: "createRouter",
      input
    });

    return router;
  }

  function renderView(view) {
    return {
      view
    };
  }

  function createModal(view) {
    return {
      view
    };
  }

  const service =
    createDiscordCharacterCreationService({
      savesDirectory: "saves",
      worldId: "development-world",
      startingLocation: "back_alley_1",
      startingCredits: 100,
      startingInventory: [
        "starter_item"
      ],
      createApplication,
      createSession,
      createRegistry,
      createRouter,
      renderView,
      createModal
    });

  return {
    calls,
    service,
    application,
    session,
    registry,
    router,
    renderView,
    createModal
  };
}

test(
  "Creates the character creation application",
  () => {
    const {
      calls,
      service,
      application
    } = createHarness();

    const applicationCall =
      calls.find(
        (call) =>
          call.method ===
          "createApplication"
      );

    assert.deepStrictEqual(
      applicationCall.input,
      {
        savesDirectory: "saves",
        worldId: "development-world"
      }
    );

    assert.strictEqual(
      service.application,
      application
    );
  }
);

test(
  "Creates the session registry",
  () => {
    const {
      calls,
      service,
      registry
    } = createHarness();

    const registryCall =
      calls.find(
        (call) =>
          call.method ===
          "createRegistry"
      );

    assert.strictEqual(
      typeof registryCall.input.createSession,
      "function"
    );

    assert.strictEqual(
      service.sessionRegistry,
      registry
    );
  }
);

test(
  "Creates sessions with configured starting state",
  () => {
    const {
      calls,
      registry,
      application,
      session
    } = createHarness();

    const created =
      registry.createSession({
        guildId: "guild-1",
        channelId: "channel-1",
        ownerId: "user-1"
      });

    assert.strictEqual(
      created,
      session
    );

    const sessionCall =
      calls.find(
        (call) =>
          call.method ===
          "createSession"
      );

    assert.strictEqual(
      sessionCall.input.application,
      application
    );

    assert.strictEqual(
      sessionCall.input.startingLocation,
      "back_alley_1"
    );

    assert.strictEqual(
      sessionCall.input.startingCredits,
      100
    );

    assert.deepStrictEqual(
      sessionCall.input.startingInventory,
      [
        "starter_item"
      ]
    );
  }
);

test(
  "Creates the interaction router",
  () => {
    const {
      calls,
      service,
      registry,
      router,
      renderView,
      createModal
    } = createHarness();

    const routerCall =
      calls.find(
        (call) =>
          call.method ===
          "createRouter"
      );

    assert.strictEqual(
      routerCall.input.sessionRegistry,
      registry
    );

    assert.strictEqual(
      routerCall.input.renderView,
      renderView
    );

    assert.strictEqual(
      routerCall.input.createNameModal,
      createModal
    );

    assert.strictEqual(
      service.router,
      router
    );
  }
);

test(
  "Returns an immutable service",
  () => {
    const {
      service
    } = createHarness();

    assert.strictEqual(
      Object.isFrozen(service),
      true
    );

    assert.deepStrictEqual(
      Object.keys(service).sort(),
      [
        "application",
        "router",
        "sessionRegistry"
      ]
    );
  }
);

test(
  "Copies starting inventory for each session",
  () => {
    const sessionInventories = [];

    const registry =
      createDiscordCharacterCreationService({
        savesDirectory: "saves",
        worldId: "development-world",
        startingLocation: "back_alley_1",
        startingInventory: [
          "starter_item"
        ],

        createApplication() {
          return {};
        },

        createSession(input) {
          sessionInventories.push(
            input.startingInventory
          );

          return {};
        },

        createRegistry(input) {
          return {
            createSession:
              input.createSession
          };
        },

        createRouter() {
          return {};
        },

        renderView() {
          return {};
        },

        createModal() {
          return {};
        }
      }).sessionRegistry;

    registry.createSession({
      guildId: "guild-1",
      channelId: "channel-1",
      ownerId: "user-1"
    });

    registry.createSession({
      guildId: "guild-1",
      channelId: "channel-1",
      ownerId: "user-2"
    });

    assert.notStrictEqual(
      sessionInventories[0],
      sessionInventories[1]
    );

    assert.deepStrictEqual(
      sessionInventories[0],
      [
        "starter_item"
      ]
    );

    assert.deepStrictEqual(
      sessionInventories[1],
      [
        "starter_item"
      ]
    );
  }
);

test(
  "Uses default starting state values",
  () => {
    let sessionInput = null;

    const service =
      createDiscordCharacterCreationService({
        savesDirectory: "saves",
        worldId: "development-world",
        startingLocation: "back_alley_1",

        createApplication() {
          return {};
        },

        createSession(input) {
          sessionInput = input;

          return {};
        },

        createRegistry(input) {
          return {
            createSession:
              input.createSession
          };
        },

        createRouter() {
          return {};
        },

        renderView() {
          return {};
        },

        createModal() {
          return {};
        }
      });

    service.sessionRegistry
      .createSession({
        guildId: "guild-1",
        channelId: "channel-1",
        ownerId: "user-1"
      });

    assert.strictEqual(
      sessionInput.startingCredits,
      0
    );

    assert.deepStrictEqual(
      sessionInput.startingInventory,
      []
    );
  }
);

test(
  "Requires valid configuration",
  () => {
    const validFactories = {
      createApplication() {
        return {};
      },

      createSession() {
        return {};
      },

      createRegistry() {
        return {};
      },

      createRouter() {
        return {};
      },

      renderView() {
        return {};
      },

      createModal() {
        return {};
      }
    };

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          ...validFactories,
          savesDirectory: "",
          worldId: "development-world",
          startingLocation: "back_alley_1"
        }),
      /savesDirectory must be a non-empty string/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          ...validFactories,
          savesDirectory: "saves",
          worldId: "",
          startingLocation: "back_alley_1"
        }),
      /worldId must be a non-empty string/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          ...validFactories,
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: ""
        }),
      /startingLocation must be a non-empty string/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          ...validFactories,
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: "back_alley_1",
          startingCredits: Number.NaN
        }),
      /startingCredits must be a finite number/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          ...validFactories,
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: "back_alley_1",
          startingInventory: null
        }),
      /startingInventory must be an array/
    );
  }
);

test(
  "Requires valid factory results",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: "back_alley_1",

          createApplication() {
            return null;
          },

          createSession() {
            return {};
          },

          createRegistry() {
            return {};
          },

          createRouter() {
            return {};
          },

          renderView() {
            return {};
          },

          createModal() {
            return {};
          }
        }),
      /createApplication result must be an object/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: "back_alley_1",

          createApplication() {
            return {};
          },

          createSession() {
            return {};
          },

          createRegistry() {
            return null;
          },

          createRouter() {
            return {};
          },

          renderView() {
            return {};
          },

          createModal() {
            return {};
          }
        }),
      /createRegistry result must be an object/
    );

    assert.throws(
      () =>
        createDiscordCharacterCreationService({
          savesDirectory: "saves",
          worldId: "development-world",
          startingLocation: "back_alley_1",

          createApplication() {
            return {};
          },

          createSession() {
            return {};
          },

          createRegistry() {
            return {};
          },

          createRouter() {
            return null;
          },

          renderView() {
            return {};
          },

          createModal() {
            return {};
          }
        }),
      /createRouter result must be an object/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CHARACTER CREATION SERVICE TESTS"
  );
  console.log(
    "================================"
  );

  let passed = 0;
  let failed = 0;

  for (const definition of tests) {
    try {
      await definition.callback();

      passed += 1;

      console.log(
        `PASS ${definition.name}`
      );
    } catch (error) {
      failed += 1;

      console.error(
        `FAIL ${definition.name}`
      );
      console.error(error);
    }
  }

  console.log(
    "================================"
  );
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log(
    "================================"
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();