"use strict";

const assert = require("assert");
const {
  performDropIntoContainerAction
} = require("../../src/game/actions/dropIntoContainerAction");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
    passed++;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed++;
  }
}

function createWorld() {
  return {
    currentTime: "03:35",
    calendar: {
      year: 2045,
      month: 1,
      dayOfMonth: 2
    }
  };
}

function createContext(overrides = {}) {
  const container = {
    id: "alley_crate",
    name: "Alley Crate",
    isOpen: true,
    isLocked: false,
    items: []
  };

  const services = {
    resolveItem() {
      return {
        id: "protein_bar",
        name: "Protein Bar"
      };
    },
    resolveContainer() {
      return container;
    },
    loadLocation() {
      return {
        id: "back_alley_1",
        objects: ["alley_crate"]
      };
    },
    removeItem(player, itemId) {
      const index = player.inventory.indexOf(itemId);

      if (index === -1) {
        return false;
      }

      player.inventory.splice(index, 1);
      return true;
    },
    addItemToContainer(target, itemId) {
      target.items.push(itemId);
    },
    saveContainer() {},
    savePlayer() {},
    loadWorld: createWorld
  };

  return {
    player: {
      id: "player_runner_1",
      location: "back_alley_1",
      inventory: ["protein_bar"]
    },
    action: {
      itemInput: "protein bar",
      containerInput: "crate"
    },
    services: {
      ...services,
      ...(overrides.services || {})
    }
  };
}

console.log("================================");
console.log("DROP INTO CONTAINER TESTS");
console.log("================================");
console.log("");

test("Records a player-to-container transfer", () => {
  let recorded = null;

  const result = performDropIntoContainerAction(
    createContext({
      services: {
        eventRecorder: {
          record(data) {
            recorded = data;
            return { eventId: "event_1" };
          }
        }
      }
    })
  );

  assert.strictEqual(result.success, true);
  assert.strictEqual(recorded.payload.fromEntityId, "player_runner_1");
  assert.strictEqual(recorded.payload.toEntityId, "alley_crate");
});

test("Returns no event without a recorder", () => {
  const result = performDropIntoContainerAction(createContext());

  assert.strictEqual(result.data.recordedEvent, null);
});

test("Does not record when item lookup fails", () => {
  let calls = 0;

  const result = performDropIntoContainerAction(
    createContext({
      services: {
        resolveItem() {
          return undefined;
        },
        eventRecorder: {
          record() {
            calls++;
          }
        }
      }
    })
  );

  assert.strictEqual(result.success, false);
  assert.strictEqual(calls, 0);
});

test("Does not record when container lookup fails", () => {
  let calls = 0;

  const result = performDropIntoContainerAction(
    createContext({
      services: {
        resolveContainer() {
          return undefined;
        },
        eventRecorder: {
          record() {
            calls++;
          }
        }
      }
    })
  );

  assert.strictEqual(result.success, false);
  assert.strictEqual(calls, 0);
});

test("Uses authoritative world time", () => {
  let recorded = null;

  performDropIntoContainerAction(
    createContext({
      services: {
        eventRecorder: {
          record(data) {
            recorded = data;
            return data;
          }
        }
      }
    })
  );

  assert.strictEqual(recorded.worldTime, "2045-01-02T03:35:00");
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
