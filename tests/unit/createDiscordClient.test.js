"use strict";

const assert = require("assert");

const {
  Events,
  GatewayIntentBits
} = require("discord.js");

const {
  createDiscordClient
} = require(
  "../../src/discord/createDiscordClient"
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
  const handlers = new Map();

  const client = {
    on(eventName, handler) {
      calls.push({
        method: "on",
        eventName,
        handler
      });

      handlers.set(
        eventName,
        handler
      );

      return client;
    }
  };

  const router = {
    async route(interaction) {
      calls.push({
        method: "route",
        interaction
      });

      return {
        handled: true
      };
    }
  };

  const logger = {
    error(...args) {
      calls.push({
        method: "error",
        args
      });
    }
  };

  function createClient(options) {
    calls.push({
      method: "createClient",
      options
    });

    return client;
  }

  const result =
    createDiscordClient({
      router,
      createClient,
      logger
    });

  return {
    calls,
    handlers,
    client,
    router,
    logger,
    result
  };
}

test(
  "Creates a Discord client with guild intents",
  () => {
    const {
      calls,
      client,
      result
    } = createHarness();

    const createCall =
      calls.find(
        (call) =>
          call.method ===
          "createClient"
      );

    assert.deepStrictEqual(
      createCall.options,
      {
        intents: [
          GatewayIntentBits.Guilds
        ]
      }
    );

    assert.strictEqual(
      result,
      client
    );
  }
);

test(
  "Registers the interaction handler",
  () => {
    const {
      calls,
      handlers
    } = createHarness();

    const onCall =
      calls.find(
        (call) =>
          call.method === "on"
      );

    assert.strictEqual(
      onCall.eventName,
      Events.InteractionCreate
    );

    assert.strictEqual(
      typeof onCall.handler,
      "function"
    );

    assert.strictEqual(
      handlers.has(
        Events.InteractionCreate
      ),
      true
    );
  }
);

test(
  "Routes Discord interactions",
  async () => {
    const {
      calls,
      handlers
    } = createHarness();

    const interaction = {
      id: "interaction-1"
    };

    const handler =
      handlers.get(
        Events.InteractionCreate
      );

    await handler(interaction);

    const routeCall =
      calls.find(
        (call) =>
          call.method === "route"
      );

    assert.strictEqual(
      routeCall.interaction,
      interaction
    );
  }
);

test(
  "Logs interaction routing failures",
  async () => {
    const calls = [];
    const handlers = new Map();

    const error =
      new Error("routing failed");

    const client = {
      on(eventName, handler) {
        handlers.set(
          eventName,
          handler
        );

        return client;
      }
    };

    const result =
      createDiscordClient({
        router: {
          async route() {
            throw error;
          }
        },

        createClient() {
          return client;
        },

        logger: {
          error(...args) {
            calls.push(args);
          }
        }
      });

    assert.strictEqual(
      result,
      client
    );

    const handler =
      handlers.get(
        Events.InteractionCreate
      );

    await handler({
      id: "interaction-1"
    });

    assert.strictEqual(
      calls.length,
      1
    );

    assert.strictEqual(
      calls[0][0],
      "Discord interaction routing failed."
    );

    assert.strictEqual(
      calls[0][1],
      error
    );
  }
);

test(
  "Does not attempt Discord login",
  () => {
    let loginCalled = false;

    const client = {
      on() {
        return client;
      },

      login() {
        loginCalled = true;
      }
    };

    createDiscordClient({
      router: {
        async route() {
          return {
            handled: false
          };
        }
      },

      createClient() {
        return client;
      },

      logger: {
        error() {}
      }
    });

    assert.strictEqual(
      loginCalled,
      false
    );
  }
);

test(
  "Requires a valid router",
  () => {
    assert.throws(
      () =>
        createDiscordClient({
          router: null
        }),
      /router must be an object/
    );

    assert.throws(
      () =>
        createDiscordClient({
          router: {}
        }),
      /router\.route must be a function/
    );
  }
);

test(
  "Requires valid construction dependencies",
  () => {
    const router = {
      async route() {}
    };

    assert.throws(
      () =>
        createDiscordClient({
          router,
          createClient: null
        }),
      /createClient must be a function/
    );

    assert.throws(
      () =>
        createDiscordClient({
          router,
          logger: null
        }),
      /logger must be an object/
    );

    assert.throws(
      () =>
        createDiscordClient({
          router,
          logger: {}
        }),
      /logger\.error must be a function/
    );
  }
);

test(
  "Requires the client factory to return a client",
  () => {
    assert.throws(
      () =>
        createDiscordClient({
          router: {
            async route() {}
          },

          createClient() {
            return null;
          },

          logger: {
            error() {}
          }
        }),
      /createClient result must be an object/
    );
  }
);

test(
  "Requires the client to support event registration",
  () => {
    assert.throws(
      () =>
        createDiscordClient({
          router: {
            async route() {}
          },

          createClient() {
            return {};
          },

          logger: {
            error() {}
          }
        }),
      /client\.on must be a function/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CLIENT TESTS"
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