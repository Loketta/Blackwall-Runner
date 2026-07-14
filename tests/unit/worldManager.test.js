"use strict";

const assert = require("assert");
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
console.log("WORLD MANAGER TESTS");
console.log("================================");
console.log("");

test("Starts without an active world", () => {
  const manager = new WorldManager();

  assert.strictEqual(manager.getActiveWorld(), null);
  assert.deepStrictEqual(manager.listWorlds(), []);
});

test("Adds and retrieves a world", () => {
  const manager = new WorldManager();
  const added = manager.addWorld(createWorldData());
  const loaded = manager.getWorld("development-world");

  assert.strictEqual(added instanceof World, true);
  assert.strictEqual(loaded, added);
});

test("Rejects duplicate world identifiers", () => {
  const manager = new WorldManager();

  manager.addWorld(createWorldData());

  assert.throws(
    () => manager.addWorld(createWorldData()),
    /World already exists/
  );
});

test("Lists worlds in identifier order", () => {
  const manager = new WorldManager({
    worlds: [
      createWorldData({
        worldId: "world-b",
        name: "World B"
      }),
      createWorldData({
        worldId: "world-a",
        name: "World A"
      })
    ]
  });

  assert.deepStrictEqual(
    manager.listWorlds().map((world) => world.worldId),
    ["world-a", "world-b"]
  );
});

test("Selects an active world", () => {
  const manager = new WorldManager({
    worlds: [createWorldData()]
  });

  const selected = manager.selectWorld("development-world");

  assert.strictEqual(selected.worldId, "development-world");
  assert.strictEqual(manager.getActiveWorld(), selected);
});

test("Rejects selecting a missing world", () => {
  const manager = new WorldManager();

  assert.throws(
    () => manager.selectWorld("missing-world"),
    /World does not exist/
  );
});

test("Replaces an existing world", () => {
  const manager = new WorldManager({
    worlds: [createWorldData()]
  });

  manager.replaceWorld(
    createWorldData({
      currentCampaignId: "campaign_1"
    })
  );

  assert.strictEqual(
    manager.getWorld("development-world").currentCampaignId,
    "campaign_1"
  );
});

test("Rejects replacing a missing world", () => {
  const manager = new WorldManager();

  assert.throws(
    () => manager.replaceWorld(createWorldData()),
    /World does not exist/
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
