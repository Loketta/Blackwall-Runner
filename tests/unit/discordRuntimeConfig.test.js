"use strict";

const assert = require("assert");

const {
  DEFAULT_STARTING_CREDITS,
  DEFAULT_STARTING_INVENTORY,
  DEFAULT_STARTING_LOCATION,
  DEFAULT_WORLD_ID,
  loadDiscordRuntimeConfig
} = require(
  "../../src/discord/discordRuntimeConfig"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createRequiredEnvironment(
  overrides = {}
) {
  return {
    DISCORD_TOKEN: "discord-token",
    DISCORD_APPLICATION_ID:
      "application-1",
    DISCORD_GUILD_ID: "guild-1",
    ...overrides
  };
}

test(
  "Loads required Discord credentials",
  () => {
    const config =
      loadDiscordRuntimeConfig(
        createRequiredEnvironment(),
        {
          defaultSavesDirectory:
            "default-saves"
        }
      );

    assert.strictEqual(
      config.token,
      "discord-token"
    );

    assert.strictEqual(
      config.applicationId,
      "application-1"
    );

    assert.strictEqual(
      config.guildId,
      "guild-1"
    );
  }
);

test(
  "Uses default Blackwall configuration",
  () => {
    const config =
      loadDiscordRuntimeConfig(
        createRequiredEnvironment(),
        {
          defaultSavesDirectory:
            "default-saves"
        }
      );

    assert.strictEqual(
      config.savesDirectory,
      "default-saves"
    );

    assert.strictEqual(
      config.worldId,
      DEFAULT_WORLD_ID
    );

    assert.strictEqual(
      config.startingLocation,
      DEFAULT_STARTING_LOCATION
    );

    assert.strictEqual(
      config.startingCredits,
      DEFAULT_STARTING_CREDITS
    );

    assert.deepStrictEqual(
      config.startingInventory,
      DEFAULT_STARTING_INVENTORY
    );
  }
);

test(
  "Loads Blackwall environment overrides",
  () => {
    const config =
      loadDiscordRuntimeConfig(
        createRequiredEnvironment({
          BLACKWALL_SAVES_DIRECTORY:
            "custom-saves",
          BLACKWALL_WORLD_ID:
            "world-2",
          BLACKWALL_STARTING_LOCATION:
            "safehouse_1"
        }),
        {
          defaultSavesDirectory:
            "default-saves"
        }
      );

    assert.strictEqual(
      config.savesDirectory,
      "custom-saves"
    );

    assert.strictEqual(
      config.worldId,
      "world-2"
    );

    assert.strictEqual(
      config.startingLocation,
      "safehouse_1"
    );
  }
);

test(
  "Trims configured string values",
  () => {
    const config =
      loadDiscordRuntimeConfig(
        createRequiredEnvironment({
          DISCORD_TOKEN:
            "  discord-token  ",
          DISCORD_APPLICATION_ID:
            "  application-1  ",
          DISCORD_GUILD_ID:
            "  guild-1  ",
          BLACKWALL_WORLD_ID:
            "  world-2  "
        }),
        {
          defaultSavesDirectory:
            "  default-saves  "
        }
      );

    assert.strictEqual(
      config.token,
      "discord-token"
    );

    assert.strictEqual(
      config.applicationId,
      "application-1"
    );

    assert.strictEqual(
      config.guildId,
      "guild-1"
    );

    assert.strictEqual(
      config.worldId,
      "world-2"
    );

    assert.strictEqual(
      config.savesDirectory,
      "default-saves"
    );
  }
);

test(
  "Returns an immutable configuration",
  () => {
    const config =
      loadDiscordRuntimeConfig(
        createRequiredEnvironment(),
        {
          defaultSavesDirectory:
            "default-saves"
        }
      );

    assert.strictEqual(
      Object.isFrozen(config),
      true
    );

    assert.notStrictEqual(
      config.startingInventory,
      DEFAULT_STARTING_INVENTORY
    );
  }
);

test(
  "Requires the Discord token",
  () => {
    assert.throws(
      () =>
        loadDiscordRuntimeConfig(
          createRequiredEnvironment({
            DISCORD_TOKEN: ""
          }),
          {
            defaultSavesDirectory:
              "default-saves"
          }
        ),
      /DISCORD_TOKEN is required/
    );
  }
);

test(
  "Requires the Discord application ID",
  () => {
    assert.throws(
      () =>
        loadDiscordRuntimeConfig(
          createRequiredEnvironment({
            DISCORD_APPLICATION_ID:
              "   "
          }),
          {
            defaultSavesDirectory:
              "default-saves"
          }
        ),
      /DISCORD_APPLICATION_ID is required/
    );
  }
);

test(
  "Requires the Discord guild ID",
  () => {
    assert.throws(
      () =>
        loadDiscordRuntimeConfig(
          createRequiredEnvironment({
            DISCORD_GUILD_ID:
              undefined
          }),
          {
            defaultSavesDirectory:
              "default-saves"
          }
        ),
      /DISCORD_GUILD_ID is required/
    );
  }
);

test(
  "Requires valid loader inputs",
  () => {
    assert.throws(
      () =>
        loadDiscordRuntimeConfig(
          null
        ),
      /environment must be an object/
    );

    assert.throws(
      () =>
        loadDiscordRuntimeConfig(
          createRequiredEnvironment(),
          {
            defaultSavesDirectory: ""
          }
        ),
      /defaultSavesDirectory must be a non-empty string/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "DISCORD RUNTIME CONFIG TESTS"
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