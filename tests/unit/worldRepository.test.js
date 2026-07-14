"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { World } = require("../../src/game/world/world");
const {
  WorldRepository
} = require("../../src/game/repositories/worldRepository");

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

function withRepository(testFunction) {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "blackwall-worlds-")
  );

  try {
    const repository = new WorldRepository({
      rootDirectory: path.join(
        temporaryDirectory,
        "worlds"
      )
    });

    testFunction(repository, temporaryDirectory);
  } finally {
    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true
    });
  }
}

function createWorldData(overrides = {}) {
  return {
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default",
    createdAt: "2045-01-01T00:00:00.000Z",
    ...overrides
  };
}

console.log("================================");
console.log("WORLD REPOSITORY TESTS");
console.log("================================");
console.log("");

test("Creates and loads a world", () => {
  withRepository((repository) => {
    const created = repository.create(
      createWorldData()
    );

    const loaded = repository.load(
      "development-world"
    );

    assert.strictEqual(created instanceof World, true);
    assert.strictEqual(loaded instanceof World, true);
    assert.deepStrictEqual(
      loaded.toJSON(),
      created.toJSON()
    );
  });
});

test("Stores metadata inside the world directory", () => {
  withRepository((repository, temporaryDirectory) => {
    repository.create(createWorldData());

    const filePath = path.join(
      temporaryDirectory,
      "worlds",
      "development-world",
      "world.json"
    );

    assert.strictEqual(fs.existsSync(filePath), true);
  });
});

test("Returns null for a missing world", () => {
  withRepository((repository) => {
    assert.strictEqual(
      repository.load("missing-world"),
      null
    );
  });
});

test("Reports whether a world exists", () => {
  withRepository((repository) => {
    assert.strictEqual(
      repository.exists("development-world"),
      false
    );

    repository.create(createWorldData());

    assert.strictEqual(
      repository.exists("development-world"),
      true
    );
  });
});

test("Rejects duplicate world identifiers", () => {
  withRepository((repository) => {
    repository.create(createWorldData());

    assert.throws(
      () => repository.create(createWorldData()),
      /World already exists/
    );
  });
});

test("Lists worlds in identifier order", () => {
  withRepository((repository) => {
    repository.create(
      createWorldData({
        worldId: "world-b",
        name: "World B"
      })
    );

    repository.create(
      createWorldData({
        worldId: "world-a",
        name: "World A"
      })
    );

    assert.deepStrictEqual(
      repository.list().map(
        (world) => world.worldId
      ),
      ["world-a", "world-b"]
    );
  });
});

test("Saves an existing world", () => {
  withRepository((repository) => {
    repository.create(createWorldData());

    repository.save(
      createWorldData({
        currentCampaignId: "campaign-1"
      })
    );

    assert.strictEqual(
      repository.load("development-world")
        .currentCampaignId,
      "campaign-1"
    );
  });
});

test("Rejects saving a missing world", () => {
  withRepository((repository) => {
    assert.throws(
      () => repository.save(createWorldData()),
      /World does not exist/
    );
  });
});

test("Rejects unsafe world identifiers", () => {
  withRepository((repository) => {
    assert.throws(
      () => repository.load("../unsafe"),
      /worldId may contain only/
    );
  });
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
