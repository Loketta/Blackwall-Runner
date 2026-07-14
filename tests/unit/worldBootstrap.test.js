"use strict";

const assert = require("assert");
const {
  bootstrapWorld,
  DEFAULT_WORLD
} = require("../../src/application/worldBootstrap");
const { World } = require("../../src/game/world/world");
const {
  WorldManager
} = require("../../src/game/managers/worldManager");

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

function createStoredWorld(overrides = {}) {
  return new World({
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default",
    createdAt: "2045-01-01T00:00:00.000Z",
    ...overrides
  });
}

console.log("================================");
console.log("WORLD BOOTSTRAP TESTS");
console.log("================================");
console.log("");

test("Defines the default development world", () => {
  assert.deepStrictEqual(DEFAULT_WORLD, {
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default"
  });

  assert.strictEqual(
    Object.isFrozen(DEFAULT_WORLD),
    true
  );
});

test("Loads an existing world", () => {
  const storedWorld = createStoredWorld();
  let createCalls = 0;

  const result = bootstrapWorld({
    worldRepository: {
      load(worldId) {
        assert.strictEqual(
          worldId,
          "development-world"
        );

        return storedWorld;
      },

      create() {
        createCalls += 1;
      }
    }
  });

  assert.strictEqual(createCalls, 0);
  assert.strictEqual(result.world, storedWorld);
  assert.strictEqual(result.created, false);
});

test("Creates a missing development world", () => {
  let createdData = null;

  const result = bootstrapWorld({
    worldRepository: {
      load() {
        return null;
      },

      create(worldData) {
        createdData = worldData;
        return new World(worldData);
      }
    },

    clock() {
      return new Date(
        "2026-07-14T12:00:00.000Z"
      );
    }
  });

  assert.deepStrictEqual(createdData, {
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default",
    createdAt: "2026-07-14T12:00:00.000Z"
  });

  assert.strictEqual(result.created, true);
  assert.strictEqual(
    result.world.worldId,
    "development-world"
  );
});

test("Selects the bootstrapped world", () => {
  const storedWorld = createStoredWorld();

  const result = bootstrapWorld({
    worldRepository: {
      load() {
        return storedWorld;
      },

      create() {
        throw new Error(
          "World should not be created."
        );
      }
    }
  });

  assert.strictEqual(
    result.worldManager instanceof WorldManager,
    true
  );

  assert.strictEqual(
    result.worldManager.getActiveWorld(),
    storedWorld
  );
});

test("Supports a custom world definition", () => {
  let requestedWorldId = null;
  let createdData = null;

  const result = bootstrapWorld({
    worldId: "test-world",
    worldName: "Test World",
    templateId: "test-template",

    worldRepository: {
      load(worldId) {
        requestedWorldId = worldId;
        return null;
      },

      create(worldData) {
        createdData = worldData;
        return new World(worldData);
      }
    },

    clock() {
      return new Date(
        "2026-07-14T13:00:00.000Z"
      );
    }
  });

  assert.strictEqual(
    requestedWorldId,
    "test-world"
  );

  assert.deepStrictEqual(createdData, {
    worldId: "test-world",
    name: "Test World",
    templateId: "test-template",
    createdAt: "2026-07-14T13:00:00.000Z"
  });

  assert.strictEqual(
    result.worldManager.getActiveWorld(),
    result.world
  );
});

test("Uses an injected world manager factory", () => {
  const storedWorld = createStoredWorld();
  let receivedOptions = null;

  const customManager = {
    getActiveWorld() {
      return storedWorld;
    }
  };

  const result = bootstrapWorld({
    worldRepository: {
      load() {
        return storedWorld;
      },

      create() {
        throw new Error(
          "World should not be created."
        );
      }
    },

    worldManagerFactory(options) {
      receivedOptions = options;
      return customManager;
    }
  });

  assert.deepStrictEqual(receivedOptions, {
    worlds: [storedWorld],
    activeWorldId: "development-world"
  });

  assert.strictEqual(
    result.worldManager,
    customManager
  );
});

test("Returns an immutable bootstrap result", () => {
  const storedWorld = createStoredWorld();

  const result = bootstrapWorld({
    worldRepository: {
      load() {
        return storedWorld;
      },

      create() {
        throw new Error(
          "World should not be created."
        );
      }
    }
  });

  assert.strictEqual(Object.isFrozen(result), true);
});

test("Rejects an invalid repository", () => {
  assert.throws(
    () => bootstrapWorld({
      worldRepository: {}
    }),
    /worldRepository must provide load and create/
  );
});

test("Rejects an invalid manager factory", () => {
  assert.throws(
    () => bootstrapWorld({
      worldRepository: {
        load() {
          return createStoredWorld();
        },

        create() {}
      },

      worldManagerFactory: null
    }),
    /worldManagerFactory must be a function/
  );
});

test("Rejects an invalid clock result", () => {
  assert.throws(
    () => bootstrapWorld({
      worldRepository: {
        load() {
          return null;
        },

        create() {}
      },

      clock() {
        return "not-a-date";
      }
    }),
    /clock must return a valid Date/
  );
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
