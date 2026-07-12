"use strict";

const assert = require("assert");
const { ActionContext } = require(
  "../../src/game/context/actionContext"
);

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS  ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL  ${name}`);
    console.error(error);
    failed += 1;
  }
}

console.log("================================");
console.log("ACTION CONTEXT TESTS");
console.log("================================");
console.log("");

test("Stores the supplied player", () => {
  const player = { id: "player_1" };
  const context = new ActionContext({
    player,
    action: { type: "look" }
  });

  assert.strictEqual(context.player, player);
});

test("Stores the supplied action", () => {
  const action = { type: "look" };
  const context = new ActionContext({
    player: {},
    action
  });

  assert.strictEqual(context.action, action);
});

test("Stores supplied services", () => {
  const eventRecorder = { record() {} };
  const context = new ActionContext({
    player: {},
    action: { type: "wait" },
    services: { eventRecorder }
  });

  assert.strictEqual(
    context.services.eventRecorder,
    eventRecorder
  );
});

test("Defaults services to an empty object", () => {
  const context = new ActionContext({
    player: {},
    action: { type: "look" }
  });

  assert.deepStrictEqual(context.services, {});
  assert.strictEqual(Object.isFrozen(context.services), true);
});

test("Prevents the context contract from being reassigned", () => {
  const context = new ActionContext({
    player: {},
    action: { type: "look" }
  });

  assert.strictEqual(Object.isFrozen(context), true);
  assert.throws(() => {
    context.action = { type: "wait" };
  }, TypeError);
});

test("Prevents the services contract from being reassigned", () => {
  const context = new ActionContext({
    player: {},
    action: { type: "look" },
    services: { eventRecorder: {} }
  });

  assert.throws(() => {
    context.services.eventRecorder = null;
  }, TypeError);
});

test("Does not freeze player state", () => {
  const player = { health: 40 };
  new ActionContext({
    player,
    action: { type: "look" }
  });

  player.health = 30;

  assert.strictEqual(player.health, 30);
  assert.strictEqual(Object.isFrozen(player), false);
});

test("Rejects invalid services", () => {
  assert.throws(
    () => new ActionContext({
      player: {},
      action: { type: "look" },
      services: null
    }),
    /services must be an object/
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
