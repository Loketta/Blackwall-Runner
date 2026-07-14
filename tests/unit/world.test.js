"use strict";

const assert = require("assert");
const { World } = require("../../src/game/world/world");

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

function createWorld(overrides = {}) {
  return new World({
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default",
    createdAt: "2045-01-01T00:00:00.000Z",
    ...overrides
  });
}

console.log("================================");
console.log("WORLD TESTS");
console.log("================================");
console.log("");

test("Creates an immutable world", () => {
  const world = createWorld();

  assert.strictEqual(world.worldId, "development-world");
  assert.strictEqual(world.name, "Development World");
  assert.strictEqual(world.templateId, "cyberpunk-default");
  assert.strictEqual(world.currentCampaignId, null);
  assert.strictEqual(world.status, "active");
  assert.strictEqual(Object.isFrozen(world), true);
});

test("Preserves an active campaign identifier", () => {
  const world = createWorld({
    currentCampaignId: "campaign_1"
  });

  assert.strictEqual(world.currentCampaignId, "campaign_1");
});

test("Rejects invalid world identifiers", () => {
  assert.throws(
    () => createWorld({ worldId: "../unsafe" }),
    /worldId may contain only/
  );
});

test("Rejects unsupported statuses", () => {
  assert.throws(
    () => createWorld({ status: "deleted" }),
    /status must be one of/
  );
});

test("Serialises world metadata", () => {
  const value = createWorld({
    currentCampaignId: "campaign_1",
    status: "archived"
  }).toJSON();

  assert.deepStrictEqual(value, {
    worldId: "development-world",
    name: "Development World",
    templateId: "cyberpunk-default",
    createdAt: "2045-01-01T00:00:00.000Z",
    currentCampaignId: "campaign_1",
    status: "archived"
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
