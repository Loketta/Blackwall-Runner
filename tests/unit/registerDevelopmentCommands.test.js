"use strict";

const assert = require("assert");

const {
  CREATE_CHARACTER_COMMAND,
  DEVELOPMENT_COMMANDS,
  registerDevelopmentCommands
} = require(
  "../../src/discord/registerDevelopmentCommands"
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
    guildId: "guild-1"
  };

  const apiResult = [
    {
      id: "command-1",
      name: "create-character"
    }
  ];

  const restClient = {
    setToken(token) {
      calls.push({
        method: "setToken",
        token
      });

      return restClient;
    },

    async put(route, options) {
      calls.push({
        method: "put",
        route,
        options
      });

      return apiResult;
    }
  };

  const logger = {
    log(...args) {
      calls.push({
        method: "log",
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

  function createRestClient() {
    calls.push({
      method: "createRestClient"
    });

    return restClient;
  }

  function createRoute(
    applicationId,
    guildId
  ) {
    calls.push({
      method: "createRoute",
      applicationId,
      guildId
    });

    return (
      `/applications/${applicationId}` +
      `/guilds/${guildId}/commands`
    );
  }

  return {
    calls,
    config,
    apiResult,
    restClient,
    logger,
    loadConfig,
    createRestClient,
    createRoute
  };
}

test(
  "Defines the create-character command",
  () => {
    assert.strictEqual(
      CREATE_CHARACTER_COMMAND.name,
      "create-character"
    );

    assert.match(
      CREATE_CHARACTER_COMMAND.description,
      /character creation/i
    );

    assert.strictEqual(
      DEVELOPMENT_COMMANDS.length,
      1
    );

    assert.strictEqual(
      DEVELOPMENT_COMMANDS[0],
      CREATE_CHARACTER_COMMAND
    );
  }
);

test(
  "Loads Discord configuration",
  async () => {
    const harness =
      createHarness();

    const environment = {
      DISCORD_TOKEN: "discord-token"
    };

    await registerDevelopmentCommands({
      environment,
      loadConfig:
        harness.loadConfig,
      createRestClient:
        harness.createRestClient,
      createRoute:
        harness.createRoute,
      logger:
        harness.logger
    });

    const configCall =
      harness.calls.find(
        (call) =>
          call.method === "loadConfig"
      );

    assert.strictEqual(
      configCall.environment,
      environment
    );
  }
);

test(
  "Authenticates the REST client",
  async () => {
    const harness =
      createHarness();

    await registerDevelopmentCommands({
      loadConfig:
        harness.loadConfig,
      createRestClient:
        harness.createRestClient,
      createRoute:
        harness.createRoute,
      logger:
        harness.logger
    });

    const tokenCall =
      harness.calls.find(
        (call) =>
          call.method === "setToken"
      );

    assert.deepStrictEqual(
      tokenCall,
      {
        method: "setToken",
        token: "discord-token"
      }
    );
  }
);

test(
  "Builds a guild command route",
  async () => {
    const harness =
      createHarness();

    await registerDevelopmentCommands({
      loadConfig:
        harness.loadConfig,
      createRestClient:
        harness.createRestClient,
      createRoute:
        harness.createRoute,
      logger:
        harness.logger
    });

    const routeCall =
      harness.calls.find(
        (call) =>
          call.method === "createRoute"
      );

    assert.deepStrictEqual(
      routeCall,
      {
        method: "createRoute",
        applicationId:
          "application-1",
        guildId:
          "guild-1"
      }
    );
  }
);

test(
  "Registers development commands",
  async () => {
    const harness =
      createHarness();

    const result =
      await registerDevelopmentCommands({
        loadConfig:
          harness.loadConfig,
        createRestClient:
          harness.createRestClient,
        createRoute:
          harness.createRoute,
        logger:
          harness.logger
      });

    const putCall =
      harness.calls.find(
        (call) =>
          call.method === "put"
      );

    assert.strictEqual(
      putCall.route,
      "/applications/application-1" +
        "/guilds/guild-1/commands"
    );

    assert.deepStrictEqual(
      putCall.options.body,
      [
        {
          ...CREATE_CHARACTER_COMMAND
        }
      ]
    );

    assert.deepStrictEqual(
      result.result,
      harness.apiResult
    );
  }
);

test(
  "Returns an immutable registration result",
  async () => {
    const harness =
      createHarness();

    const result =
      await registerDevelopmentCommands({
        loadConfig:
          harness.loadConfig,
        createRestClient:
          harness.createRestClient,
        createRoute:
          harness.createRoute,
        logger:
          harness.logger
      });

    assert.strictEqual(
      Object.isFrozen(result),
      true
    );

    assert.strictEqual(
      result.commands.length,
      1
    );

    assert.notStrictEqual(
      result.commands,
      DEVELOPMENT_COMMANDS
    );

    assert.notStrictEqual(
      result.commands[0],
      CREATE_CHARACTER_COMMAND
    );

    assert.strictEqual(
      Object.isFrozen(
        result.commands[0]
      ),
      true
    );
  }
);

test(
  "Logs registration progress",
  async () => {
    const harness =
      createHarness();

    await registerDevelopmentCommands({
      loadConfig:
        harness.loadConfig,
      createRestClient:
        harness.createRestClient,
      createRoute:
        harness.createRoute,
      logger:
        harness.logger
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
        "Registering Discord development commands..."
      ),
      true
    );

    assert.strictEqual(
      messages.includes(
        "Registered 1 Discord development command(s)."
      ),
      true
    );
  }
);

test(
  "Supports REST clients that do not return themselves from setToken",
  async () => {
    const calls = [];

    const restClient = {
      setToken(token) {
        calls.push({
          method: "setToken",
          token
        });

        return undefined;
      },

      async put(route, options) {
        calls.push({
          method: "put",
          route,
          options
        });

        return [];
      }
    };

    await registerDevelopmentCommands({
      loadConfig() {
        return {
          token: "discord-token",
          applicationId:
            "application-1",
          guildId: "guild-1"
        };
      },

      createRestClient() {
        return restClient;
      },

      createRoute() {
        return "route-1";
      },

      logger: {
        log() {}
      }
    });

    assert.strictEqual(
      calls.some(
        (call) =>
          call.method === "put"
      ),
      true
    );
  }
);

test(
  "Requires valid registration dependencies",
  async () => {
    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          loadConfig: null
        }),
      /loadConfig must be a function/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          createRestClient: null
        }),
      /createRestClient must be a function/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          createRoute: null
        }),
      /createRoute must be a function/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          commands: null
        }),
      /commands must be an array/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          logger: null
        }),
      /logger must be an object/
    );
  }
);

test(
  "Requires valid constructed results",
  async () => {
    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          loadConfig() {
            return null;
          }
        }),
      /loadConfig result must be an object/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          loadConfig() {
            return {
              token: "token",
              applicationId:
                "application-1",
              guildId: "guild-1"
            };
          },

          createRestClient() {
            return null;
          }
        }),
      /createRestClient result must be an object/
    );

    await assert.rejects(
      () =>
        registerDevelopmentCommands({
          loadConfig() {
            return {
              token: "token",
              applicationId:
                "application-1",
              guildId: "guild-1"
            };
          },

          createRestClient() {
            return {
              setToken() {
                return {};
              },

              put() {}
            };
          }
        }),
      /authenticated REST client put must be a function/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD DEVELOPMENT COMMAND REGISTRATION TESTS"
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