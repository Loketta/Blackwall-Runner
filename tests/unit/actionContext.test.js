const assert = require("assert");
const {
  ActionContext
} = require("../../src/game/context/actionContext");

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
  const player = {
    id: "player_1"
  };

  const action = {
    type: "look"
  };

  const context = new ActionContext({
    player,
    action
  });

  assert.strictEqual(context.player, player);
});

test("Stores the supplied action", () => {
  const player = {
    id: "player_1"
  };

  const action = {
    type: "look"
  };

  const context = new ActionContext({
    player,
    action
  });

  assert.strictEqual(context.action, action);
});

test("Prevents the context contract from being reassigned", () => {
  const player = {
    id: "player_1"
  };

  const action = {
    type: "look"
  };

  const context = new ActionContext({
    player,
    action
  });

  assert.strictEqual(Object.isFrozen(context), true);
});

test("Does not freeze player state", () => {
  const player = {
    id: "player_1",
    location: "safehouse_1"
  };

  const action = {
    type: "move"
  };

  const context = new ActionContext({
    player,
    action
  });

  context.player.location = "street_1";

  assert.strictEqual(context.player.location, "street_1");
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
