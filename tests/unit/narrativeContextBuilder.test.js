"use strict";

const assert = require("assert");
const {
  NarrativeContextBuilder
} = require(
  "../../src/game/ai/narrativeContextBuilder"
);

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

function createAIContext(overrides = {}) {
  return {
    player: {
      id: "player_1",
      name: "Runner",
      role: "Solo",
      health: 40,
      credits: 100,
      inventory: ["unity_pistol"]
    },

    world: {
      id: "world_1",
      name: "Blackwall Runner",
      city: "Neon Shallows",
      day: 2,
      currentTime: "03:05",
      weather: "light rain",
      calendar: {
        year: 2045,
        month: 1,
        dayOfMonth: 2
      }
    },

    location: {
      id: "back_alley_1",
      name: "Back Alley",
      type: "street",
      description: "A narrow service alley.",
      exits: [
        {
          name: "safehouse",
          destination: "safehouse_1",
          description: "A battered side door."
        }
      ]
    },

    nearbyNpcs: [
      {
        id: "finch",
        name: "Finch",
        description: "A nervous courier.",
        role: "courier",
        dialogue: "Hidden implementation detail."
      }
    ],

    nearbyItems: [
      {
        id: "protein_bar",
        name: "Protein Bar",
        type: "food",
        description: "A synthetic meal bar.",
        value: 5
      }
    ],

    nearbyObjects: [
      {
        id: "alley_crate",
        name: "Alley Crate",
        type: "container",
        description: "A dented shipping crate.",
        state: {
          isOpen: true,
          isLocked: false
        },
        inventory: ["protein_bar"]
      }
    ],

    nearbyShops: [
      {
        id: "kuroda_mart",
        name: "Kuroda Mart",
        description: "A battered corner shop.",
        isOpen: true,
        stock: [
          {
            itemId: "protein_bar",
            price: 10
          }
        ]
      }
    ],

    recentEvents: [
      {
        eventId: "event_1",
        type: "WeatherChanged",
        worldTime: "2045-01-02T03:05:00",
        actorId: null,
        targetIds: [],
        locationId: null,
        payload: {
          previousWeather: "cloudy",
          newWeather: "light rain"
        },
        metadata: {
          source: "weatherEvents"
        }
      }
    ],

    ...overrides
  };
}

console.log("================================");
console.log("NARRATIVE CONTEXT BUILDER TESTS");
console.log("================================");
console.log("");

test("Builds formatted world context", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(context.world, {
    id: "world_1",
    name: "Blackwall Runner",
    city: "Neon Shallows",
    day: 2,
    time: "2045-01-02T03:05:00",
    weather: "light rain"
  });
});

test("Builds player context", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(context.player, {
    id: "player_1",
    name: "Runner",
    role: "Solo",
    health: 40,
    credits: 100,
    inventory: ["unity_pistol"]
  });
});

test("Builds location and exit context", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.strictEqual(
    context.location.id,
    "back_alley_1"
  );
  assert.deepStrictEqual(
    context.location.exits,
    [
      {
        name: "safehouse",
        destination: "safehouse_1",
        description: "A battered side door."
      }
    ]
  );
});

test("Maps visible characters", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(
    context.visibleCharacters,
    [
      {
        id: "finch",
        name: "Finch",
        description: "A nervous courier.",
        role: "courier"
      }
    ]
  );

  assert.strictEqual(
    Object.hasOwn(
      context.visibleCharacters[0],
      "dialogue"
    ),
    false
  );
});

test("Maps visible items", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(
    context.visibleItems,
    [
      {
        id: "protein_bar",
        name: "Protein Bar",
        type: "food",
        description: "A synthetic meal bar."
      }
    ]
  );
});

test("Maps visible world objects", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(
    context.visibleObjects,
    [
      {
        id: "alley_crate",
        name: "Alley Crate",
        type: "container",
        description: "A dented shipping crate.",
        state: {
          isOpen: true,
          isLocked: false
        }
      }
    ]
  );

  assert.strictEqual(
    Object.hasOwn(
      context.visibleObjects[0],
      "inventory"
    ),
    false
  );
});

test("Maps visible shops without stock details", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(
    context.visibleShops,
    [
      {
        id: "kuroda_mart",
        name: "Kuroda Mart",
        description: "A battered corner shop.",
        isOpen: true
      }
    ]
  );
});

test("Maps recent domain events", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.deepStrictEqual(
    context.recentEvents,
    [
      {
        eventId: "event_1",
        type: "WeatherChanged",
        worldTime: "2045-01-02T03:05:00",
        actorId: null,
        targetIds: [],
        locationId: null,
        payload: {
          previousWeather: "cloudy",
          newWeather: "light rain"
        }
      }
    ]
  );

  assert.strictEqual(
    Object.hasOwn(
      context.recentEvents[0],
      "metadata"
    ),
    false
  );
});

test("Defaults optional collections to empty arrays", () => {
  const aiContext = createAIContext({
    nearbyNpcs: undefined,
    nearbyItems: undefined,
    nearbyObjects: undefined,
    nearbyShops: undefined,
    recentEvents: undefined
  });

  const context =
    new NarrativeContextBuilder().build(
      aiContext
    );

  assert.deepStrictEqual(
    context.visibleCharacters,
    []
  );
  assert.deepStrictEqual(
    context.visibleItems,
    []
  );
  assert.deepStrictEqual(
    context.visibleObjects,
    []
  );
  assert.deepStrictEqual(
    context.visibleShops,
    []
  );
  assert.deepStrictEqual(
    context.recentEvents,
    []
  );
});

test("Returns a deeply frozen context", () => {
  const context =
    new NarrativeContextBuilder().build(
      createAIContext()
    );

  assert.strictEqual(
    Object.isFrozen(context),
    true
  );
  assert.strictEqual(
    Object.isFrozen(context.player),
    true
  );
  assert.strictEqual(
    Object.isFrozen(context.visibleCharacters),
    true
  );
  assert.strictEqual(
    Object.isFrozen(context.recentEvents[0].payload),
    true
  );

  assert.throws(
    () => {
      context.player.name = "Changed";
    },
    TypeError
  );
});

test("Does not retain mutable source references", () => {
  const aiContext = createAIContext();

  const context =
    new NarrativeContextBuilder().build(
      aiContext
    );

  aiContext.player.name = "Changed";
  aiContext.world.weather = "storm";
  aiContext.nearbyNpcs[0].name = "Changed";

  assert.strictEqual(
    context.player.name,
    "Runner"
  );
  assert.strictEqual(
    context.world.weather,
    "light rain"
  );
  assert.strictEqual(
    context.visibleCharacters[0].name,
    "Finch"
  );
});

test("Rejects an invalid AI context", () => {
  const builder = new NarrativeContextBuilder();

  assert.throws(
    () => builder.build(null),
    /aiContext must be an object/
  );
});

test("Rejects missing required context sections", () => {
  const builder = new NarrativeContextBuilder();

  assert.throws(
    () => builder.build(
      createAIContext({
        player: null
      })
    ),
    /aiContext.player must be an object/
  );

  assert.throws(
    () => builder.build(
      createAIContext({
        world: null
      })
    ),
    /aiContext.world must be an object/
  );

  assert.throws(
    () => builder.build(
      createAIContext({
        location: null
      })
    ),
    /aiContext.location must be an object/
  );
});

test("Rejects a world without calendar data", () => {
  const builder = new NarrativeContextBuilder();
  const aiContext = createAIContext();

  delete aiContext.world.calendar;

  assert.throws(
    () => builder.build(aiContext),
    /world.calendar must be an object/
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
