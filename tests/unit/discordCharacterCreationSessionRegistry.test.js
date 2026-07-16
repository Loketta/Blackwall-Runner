"use strict";

const assert = require("assert");

const {
  createDiscordCharacterCreationSessionRegistry,
  createSessionKey
} = require(
  "../../src/discord/characterCreation/discordCharacterCreationSessionRegistry"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createIdentity(overrides = {}) {
  return {
    guildId: "guild-1",
    channelId: "channel-1",
    ownerId: "user-1",
    ...overrides
  };
}

function createRegistryHarness() {
  const createdSessions = [];

  const registry =
    createDiscordCharacterCreationSessionRegistry({
      createSession(identity) {
        const session = {
          id:
            `session-${createdSessions.length + 1}`,
          identity
        };

        createdSessions.push(session);

        return session;
      }
    });

  return {
    registry,
    createdSessions
  };
}

test(
  "Creates a stable session key",
  () => {
    assert.strictEqual(
      createSessionKey(
        createIdentity()
      ),
      "guild-1:channel-1:user-1"
    );
  }
);

test(
  "Starts and retrieves a session",
  () => {
    const {
      registry,
      createdSessions
    } = createRegistryHarness();

    const identity = createIdentity();

    const session =
      registry.start(identity);

    assert.strictEqual(
      session,
      createdSessions[0]
    );

    assert.strictEqual(
      registry.get(identity),
      session
    );

    assert.strictEqual(
      registry.has(identity),
      true
    );

    assert.strictEqual(
      registry.size(),
      1
    );
  }
);

test(
  "Keeps users isolated",
  () => {
    const {
      registry
    } = createRegistryHarness();

    const firstIdentity =
      createIdentity({
        ownerId: "user-1"
      });

    const secondIdentity =
      createIdentity({
        ownerId: "user-2"
      });

    const firstSession =
      registry.start(firstIdentity);

    const secondSession =
      registry.start(secondIdentity);

    assert.notStrictEqual(
      firstSession,
      secondSession
    );

    assert.strictEqual(
      registry.get(firstIdentity),
      firstSession
    );

    assert.strictEqual(
      registry.get(secondIdentity),
      secondSession
    );

    assert.strictEqual(
      registry.size(),
      2
    );
  }
);

test(
  "Keeps channels isolated",
  () => {
    const {
      registry
    } = createRegistryHarness();

    const firstIdentity =
      createIdentity({
        channelId: "channel-1"
      });

    const secondIdentity =
      createIdentity({
        channelId: "channel-2"
      });

    registry.start(firstIdentity);
    registry.start(secondIdentity);

    assert.strictEqual(
      registry.size(),
      2
    );
  }
);

test(
  "Returns an existing session from getOrStart",
  () => {
    const {
      registry,
      createdSessions
    } = createRegistryHarness();

    const identity = createIdentity();

    const first =
      registry.getOrStart(identity);

    const second =
      registry.getOrStart(identity);

    assert.strictEqual(
      first.created,
      true
    );

    assert.strictEqual(
      second.created,
      false
    );

    assert.strictEqual(
      first.session,
      second.session
    );

    assert.strictEqual(
      createdSessions.length,
      1
    );
  }
);

test(
  "Rejects duplicate starts",
  () => {
    const {
      registry
    } = createRegistryHarness();

    const identity = createIdentity();

    registry.start(identity);

    assert.throws(
      () => registry.start(identity),
      /session already exists/
    );
  }
);

test(
  "Removes a session",
  () => {
    const {
      registry
    } = createRegistryHarness();

    const identity = createIdentity();

    const session =
      registry.start(identity);

    assert.strictEqual(
      registry.remove(identity),
      session
    );

    assert.strictEqual(
      registry.get(identity),
      null
    );

    assert.strictEqual(
      registry.has(identity),
      false
    );

    assert.strictEqual(
      registry.size(),
      0
    );
  }
);

test(
  "Returns null when removing a missing session",
  () => {
    const {
      registry
    } = createRegistryHarness();

    assert.strictEqual(
      registry.remove(
        createIdentity()
      ),
      null
    );
  }
);

test(
  "Clears every session",
  () => {
    const {
      registry
    } = createRegistryHarness();

    registry.start(
      createIdentity({
        ownerId: "user-1"
      })
    );

    registry.start(
      createIdentity({
        ownerId: "user-2"
      })
    );

    registry.clear();

    assert.strictEqual(
      registry.size(),
      0
    );
  }
);

test(
  "Requires valid identities",
  () => {
    assert.throws(
      () =>
        createSessionKey({
          guildId: "",
          channelId: "channel-1",
          ownerId: "user-1"
        }),
      /guildId must be a non-empty string/
    );

    assert.throws(
      () =>
        createSessionKey({
          guildId: "guild-1",
          channelId: "",
          ownerId: "user-1"
        }),
      /channelId must be a non-empty string/
    );

    assert.throws(
      () =>
        createSessionKey({
          guildId: "guild-1",
          channelId: "channel-1",
          ownerId: ""
        }),
      /ownerId must be a non-empty string/
    );
  }
);

test(
  "Requires a session factory",
  () => {
    assert.throws(
      () =>
        createDiscordCharacterCreationSessionRegistry({
          createSession: null
        }),
      /createSession must be a function/
    );
  }
);

test(
  "Requires the factory to return a session object",
  () => {
    const registry =
      createDiscordCharacterCreationSessionRegistry({
        createSession() {
          return null;
        }
      });

    assert.throws(
      () =>
        registry.start(
          createIdentity()
        ),
      /createSession must return an object/
    );

    assert.strictEqual(
      registry.size(),
      0
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD CHARACTER CREATION SESSION REGISTRY TESTS"
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
