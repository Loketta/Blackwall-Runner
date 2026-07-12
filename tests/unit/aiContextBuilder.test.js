"use strict";

const assert = require("assert");
const {
  AIContextBuilder
} = require("../../src/game/ai/aiContextBuilder");

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

function createPlayer(overrides = {}) {
  return {
    id: "player_1",
    name: "Runner",
    location: "back_alley_1",
    inventory: ["item_1"],
    ...overrides
  };
}

function createWorld(overrides = {}) {
  return {
    id: "world_1",
    currentTime: "03:05",
    weather: "light rain",
    ...overrides
  };
}

function createBuilder() {
  return new AIContextBuilder({
    loadLocationService(locationId) {
      if (locationId !== "back_alley_1") {
        return null;
      }

      return {
        id: "back_alley_1",
        name: "Back Alley",
        npcs: ["npc_1", "missing_npc"],
        items: ["item_2", "missing_item"],
        objects: ["object_1", "missing_object"],
        exits: []
      };
    },

    loadNpcService(npcId) {
      if (npcId === "npc_1") {
        return {
          id: "npc_1",
          name: "Finch"
        };
      }

      return null;
    },

    loadItemService(itemId) {
      if (itemId === "item_2") {
        return {
          id: "item_2",
          name: "Protein Bar"
        };
      }

      return null;
    },

    loadWorldObjectService(objectId) {
      if (objectId === "object_1") {
        return {
          id: "object_1",
          name: "Alley Crate",
          type: "container"
        };
      }

      return null;
    },

    loadShopsService() {
      return [
        {
          id: "shop_1",
          name: "Kuroda Mart",
          locationId: "back_alley_1"
        },
        {
          id: "shop_2",
          name: "Other Shop",
          locationId: "market_1"
        }
      ];
    }
  });
}

console.log("================================");
console.log("AI CONTEXT BUILDER TESTS");
console.log("================================");
console.log("");

test("Builds context from player and world state", () => {
  const builder = createBuilder();
  const player = createPlayer();
  const world = createWorld();

  const context = builder.build({
    player,
    world
  });

  assert.strictEqual(context.player.id, "player_1");
  assert.strictEqual(context.world.id, "world_1");
  assert.strictEqual(
    context.location.id,
    "back_alley_1"
  );
});

test("Resolves nearby NPCs", () => {
  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld()
  });

  assert.deepStrictEqual(
    context.nearbyNpcs.map((npc) => npc.id),
    ["npc_1"]
  );
});

test("Resolves nearby items", () => {
  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld()
  });

  assert.deepStrictEqual(
    context.nearbyItems.map((item) => item.id),
    ["item_2"]
  );
});

test("Resolves nearby world objects", () => {
  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld()
  });

  assert.deepStrictEqual(
    context.nearbyObjects.map((object) => object.id),
    ["object_1"]
  );
});

test("Resolves shops at the current location", () => {
  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld()
  });

  assert.deepStrictEqual(
    context.nearbyShops.map((shop) => shop.id),
    ["shop_1"]
  );
});

test("Includes recent event history", () => {
  let suppliedLimit = null;

  const recentEvents = [
    {
      eventId: "event_1",
      type: "WeatherChanged"
    }
  ];

  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld(),
    recentEventLimit: 5,
    eventHistory: {
      getRecent(limit) {
        suppliedLimit = limit;
        return recentEvents;
      }
    }
  });

  assert.strictEqual(suppliedLimit, 5);
  assert.deepStrictEqual(
    context.recentEvents,
    recentEvents
  );
});

test("Defaults recent events to an empty collection", () => {
  const context = createBuilder().build({
    player: createPlayer(),
    world: createWorld()
  });

  assert.deepStrictEqual(
    context.recentEvents,
    []
  );
});

test("Returns a deeply frozen context", () => {
  const player = createPlayer();
  const context = createBuilder().build({
    player,
    world: createWorld()
  });

  assert.strictEqual(
    Object.isFrozen(context),
    true
  );
  assert.strictEqual(
    Object.isFrozen(context.player),
    true
  );
  assert.strictEqual(
    Object.isFrozen(context.nearbyNpcs),
    true
  );

  assert.throws(
    () => {
      context.player.name = "Changed";
    },
    TypeError
  );
});

test("Does not retain mutable engine references", () => {
  const player = createPlayer();
  const world = createWorld();

  const context = createBuilder().build({
    player,
    world
  });

  player.name = "Changed";
  world.weather = "storm";

  assert.strictEqual(
    context.player.name,
    "Runner"
  );
  assert.strictEqual(
    context.world.weather,
    "light rain"
  );
});

test("Rejects invalid player and world values", () => {
  const builder = createBuilder();

  assert.throws(
    () => builder.build({
      player: null,
      world: createWorld()
    }),
    /player must be an object/
  );

  assert.throws(
    () => builder.build({
      player: createPlayer(),
      world: null
    }),
    /world must be an object/
  );
});

test("Rejects a player without a location", () => {
  const builder = createBuilder();

  assert.throws(
    () => builder.build({
      player: createPlayer({
        location: ""
      }),
      world: createWorld()
    }),
    /player.location must be a non-empty string/
  );
});

test("Rejects an invalid recent event limit", () => {
  const builder = createBuilder();

  assert.throws(
    () => builder.build({
      player: createPlayer(),
      world: createWorld(),
      recentEventLimit: -1
    }),
    /recentEventLimit must be a non-negative integer/
  );
});

test("Rejects an invalid event history", () => {
  const builder = createBuilder();

  assert.throws(
    () => builder.build({
      player: createPlayer(),
      world: createWorld(),
      eventHistory: {}
    }),
    /eventHistory must provide a getRecent function/
  );
});

test("Rejects an unresolved player location", () => {
  const builder = createBuilder();

  assert.throws(
    () => builder.build({
      player: createPlayer({
        location: "missing_location"
      }),
      world: createWorld()
    }),
    /could not be loaded/
  );
});

test("Rejects invalid loader services", () => {
  assert.throws(
    () => new AIContextBuilder({
      loadNpcService: null
    }),
    /loadNpcService must be a function/
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
