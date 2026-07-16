"use strict";

const assert = require("assert");

const {
  Events
} = require("discord.js");

const {
  startDiscordBot
} = require(
  "../../src/discord/startDiscordBot"
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

  const config = {
    token: "discord-token",
    applicationId: "application-1",
    guildId: "guild-1",
    savesDirectory: "saves",
    worldId: "development-world",
    startingLocation: "back_alley_1",
    startingCredits: 100,
    startingInventory: [
      "starter_item"
    ]
  };

  const router = {
    async route() {
      return {
        handled: true
      };
    }
  };

  const service = {
    router
  };

  const onceHandlers =
    new Map();

  const client = {
    once(eventName, handler) {
      calls.push({
        method: "once",
        eventName,
        handler
      });

      onceHandlers.set(
        eventName,
        handler
      );

      return client;
    },

    async login(token) {
      calls.push({
        method: "login",
        token
      });

      return token;
    }
  };

  const logger = {
    log(...args) {
      calls.push({
        method: "log",
        args
      });
    },

    error(...args) {
      calls.push({
        method: "error",
        args
      });
    }
  };

  function loadConfig(environment) {
    calls.push({
      method: "loadConfig",
      environment
    });

    return config;
  }

  function createService(input) {
    calls.push({
      method: "createService",
      input
    });

    return service;
  }

  function createClient(input) {
    calls.push({
      method: "createClient",
      input
    });

    return client;
  }

  return {
    calls,
    config,
    router,
    service,
    client,
    logger,
    onceHandlers,
    loadConfig,
    createService,
    createClient
  };
}

test(
  "Loads configuration from the supplied environment",
  async () => {
    const harness =
      createHarness();

    const environment = {
      DISCORD_TOKEN:
        "discord-token"
    };

    await startDiscordBot({
      environment,
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    const configCall =
      harness.calls.find(
        (call) =>
          call.method ===
          "loadConfig"
      );

    assert.strictEqual(
      configCall.environment,
      environment
    );
  }
);

test(
  "Creates the character creation service from configuration",
  async () => {
    const harness =
      createHarness();

    await startDiscordBot({
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    const serviceCall =
      harness.calls.find(
        (call) =>
          call.method ===
          "createService"
      );

    assert.deepStrictEqual(
      serviceCall.input,
      {
        savesDirectory:
          "saves",
        worldId:
          "development-world",
        startingLocation:
          "back_alley_1",
        startingCredits:
          100,
        startingInventory: [
          "starter_item"
        ]
      }
    );
  }
);

test(
  "Creates the Discord client with the service router",
  async () => {
    const harness =
      createHarness();

    await startDiscordBot({
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    const clientCall =
      harness.calls.find(
        (call) =>
          call.method ===
          "createClient"
      );

    assert.strictEqual(
      clientCall.input.router,
      harness.router
    );

    assert.strictEqual(
      clientCall.input.logger,
      harness.logger
    );
  }
);

test(
  "Registers a client-ready handler",
  async () => {
    const harness =
      createHarness();

    await startDiscordBot({
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    assert.strictEqual(
      harness.onceHandlers.has(
        Events.ClientReady
      ),
      true
    );

    const handler =
      harness.onceHandlers.get(
        Events.ClientReady
      );

    assert.strictEqual(
      typeof handler,
      "function"
    );
  }
);

test(
  "Logs in with the configured token",
  async () => {
    const harness =
      createHarness();

    await startDiscordBot({
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    const loginCall =
      harness.calls.find(
        (call) =>
          call.method === "login"
      );

    assert.deepStrictEqual(
      loginCall,
      {
        method: "login",
        token: "discord-token"
      }
    );
  }
);

test(
  "Logs startup and ready status",
  async () => {
    const harness =
      createHarness();

    await startDiscordBot({
      loadConfig:
        harness.loadConfig,
      createService:
        harness.createService,
      createClient:
        harness.createClient,
      logger:
        harness.logger
    });

    const startupLog =
      harness.calls.find(
        (call) =>
          call.method === "log" &&
          call.args[0] ===
            "Connecting to Discord..."
      );

    assert.ok(startupLog);

    const readyHandler =
      harness.onceHandlers.get(
        Events.ClientReady
      );

    readyHandler({
      user: {
        tag: "Blackwall Runner#1234"
      }
    });

    const messages =
      harness.calls
        .filter(
          (call) =>
            call.method === "log"
        )
        .map(
          (call) =>
            call.args[0]
        );

    assert.strictEqual(
      messages.includes(
        "Logged in as Blackwall Runner#1234"
      ),
      true
    );

    assert.strictEqual(
      messages.includes(
        "Listening for Discord interactions."
      ),
      true
    );
  }
);

test(
  "Returns the constructed runtime",
  async () => {
    const harness =
      createHarness();

    const result =
      await startDiscordBot({
        loadConfig:
          harness.loadConfig,
        createService:
          harness.createService,
        createClient:
          harness.createClient,
        logger:
          harness.logger
      });

    assert.strictEqual(
      result.client,
      harness.client
    );

    assert.strictEqual(
      result.service,
      harness.service
    );

    assert.strictEqual(
      result.config,
      harness.config
    );

    assert.strictEqual(
      Object.isFrozen(result),
      true
    );
  }
);

test(
  "Requires valid startup dependencies",
  async () => {
    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig: null
        }),
      /loadConfig must be a function/
    );

    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig() {
            return {};
          },
          createService: null
        }),
      /createService must be a function/
    );

    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig() {
            return {};
          },
          createService() {
            return {
              router: {}
            };
          },
          createClient: null
        }),
      /createClient must be a function/
    );
  }
);

test(
  "Requires valid constructed results",
  async () => {
    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig() {
            return null;
          }
        }),
      /loadConfig result must be an object/
    );

    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig() {
            return {
              savesDirectory: "saves",
              worldId:
                "development-world",
              startingLocation:
                "back_alley_1",
              startingCredits: 0,
              startingInventory: [],
              token: "token"
            };
          },

          createService() {
            return null;
          }
        }),
      /createService result must be an object/
    );

    await assert.rejects(
      () =>
        startDiscordBot({
          loadConfig() {
            return {
              savesDirectory: "saves",
              worldId:
                "development-world",
              startingLocation:
                "back_alley_1",
              startingCredits: 0,
              startingInventory: [],
              token: "token"
            };
          },

          createService() {
            return {
              router: {}
            };
          },

          createClient() {
            return null;
          }
        }),
      /createClient result must be an object/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD BOT STARTUP TESTS"
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