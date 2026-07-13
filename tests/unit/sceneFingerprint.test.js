"use strict";

const assert = require("assert");

const {
  SceneFingerprint
} = require(
  "../../src/game/presentation/sceneFingerprint"
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

function createNarrativeContext(overrides = {}) {
  return {
    world: {
      id: "world_1",
      name: "Blackwall Runner",
      city: "Neon Shallows",
      day: 2,
      time: "2045-01-02T03:05:00",
      weather: "light rain"
    },
    player: {
      id: "player_1",
      name: "Runner",
      role: "Solo",
      health: 40,
      credits: 100,
      inventory: ["unity_pistol"]
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
    visibleCharacters: [
      {
        id: "finch",
        name: "Finch",
        description: "A nervous courier.",
        role: "courier"
      }
    ],
    visibleItems: [
      {
        id: "protein_bar",
        name: "Protein Bar",
        type: "food",
        description: "A synthetic meal bar."
      }
    ],
    visibleObjects: [
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
    ],
    visibleShops: [
      {
        id: "kuroda_mart",
        name: "Kuroda Mart",
        description: "A battered corner shop.",
        isOpen: true
      }
    ],
    recentEvents: [
      {
        eventId: "event_1",
        type: "WeatherChanged"
      }
    ],
    ...overrides
  };
}

function createFingerprint(
  contextOverrides = {},
  promptVersion = "scene-v1"
) {
  return new SceneFingerprint({
    narrativeContext:
      createNarrativeContext(contextOverrides),
    promptVersion
  });
}

console.log("================================");
console.log("SCENE FINGERPRINT TESTS");
console.log("================================");
console.log("");

test("Creates a SHA-256 fingerprint", () => {
  const fingerprint = createFingerprint();

  assert.match(
    fingerprint.value,
    /^[a-f0-9]{64}$/
  );
});

test("Creates deterministic fingerprints", () => {
  const first = createFingerprint();
  const second = createFingerprint();

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Normalises the prompt version", () => {
  const fingerprint = createFingerprint(
    {},
    "  scene-v1  "
  );

  assert.strictEqual(
    fingerprint.promptVersion,
    "scene-v1"
  );
});

test("Returns an immutable fingerprint", () => {
  const fingerprint = createFingerprint();

  assert.strictEqual(
    Object.isFrozen(fingerprint),
    true
  );

  assert.throws(
    () => {
      fingerprint.value = "changed";
    },
    TypeError
  );
});

test("Changes when the location changes", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    location: {
      id: "safehouse_1",
      name: "Safehouse",
      type: "interior",
      description: "A cramped rented room.",
      exits: []
    }
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when visible characters change", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    visibleCharacters: []
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when visible items change", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    visibleItems: []
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when visible object state changes", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    visibleObjects: [
      {
        id: "alley_crate",
        name: "Alley Crate",
        type: "container",
        description: "A dented shipping crate.",
        state: {
          isOpen: false,
          isLocked: false
        }
      }
    ]
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when visible shop state changes", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    visibleShops: [
      {
        id: "kuroda_mart",
        name: "Kuroda Mart",
        description: "A battered corner shop.",
        isOpen: false
      }
    ]
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when weather changes", () => {
  const first = createFingerprint();

  const changedContext =
    createNarrativeContext();

  changedContext.world = {
    ...changedContext.world,
    weather: "heavy rain"
  };

  const second = new SceneFingerprint({
    narrativeContext: changedContext,
    promptVersion: "scene-v1"
  });

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Changes when the prompt version changes", () => {
  const first = createFingerprint(
    {},
    "scene-v1"
  );
  const second = createFingerprint(
    {},
    "scene-v2"
  );

  assert.notStrictEqual(
    first.value,
    second.value
  );
});

test("Ignores player state changes", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    player: {
      id: "player_1",
      name: "Runner",
      role: "Solo",
      health: 10,
      credits: 999,
      inventory: []
    }
  });

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Ignores recent event changes", () => {
  const first = createFingerprint();
  const second = createFingerprint({
    recentEvents: [
      {
        eventId: "event_99",
        type: "CharacterTravelled"
      }
    ]
  });

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Ignores exact world time changes", () => {
  const firstContext =
    createNarrativeContext();
  const secondContext =
    createNarrativeContext();

  secondContext.world = {
    ...secondContext.world,
    day: 3,
    time: "2045-01-03T18:45:00"
  };

  const first = new SceneFingerprint({
    narrativeContext: firstContext,
    promptVersion: "scene-v1"
  });
  const second = new SceneFingerprint({
    narrativeContext: secondContext,
    promptVersion: "scene-v1"
  });

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Ignores visible collection ordering", () => {
  const firstContext =
    createNarrativeContext({
      visibleCharacters: [
        {
          id: "finch",
          name: "Finch"
        },
        {
          id: "iris",
          name: "Iris"
        }
      ]
    });

  const secondContext =
    createNarrativeContext({
      visibleCharacters: [
        {
          id: "iris",
          name: "Iris"
        },
        {
          id: "finch",
          name: "Finch"
        }
      ]
    });

  const first = new SceneFingerprint({
    narrativeContext: firstContext,
    promptVersion: "scene-v1"
  });
  const second = new SceneFingerprint({
    narrativeContext: secondContext,
    promptVersion: "scene-v1"
  });

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Ignores object property ordering", () => {
  const firstContext =
    createNarrativeContext();

  const secondContext =
    createNarrativeContext({
      visibleObjects: [
        {
          state: {
            isLocked: false,
            isOpen: true
          },
          description:
            "A dented shipping crate.",
          type: "container",
          name: "Alley Crate",
          id: "alley_crate"
        }
      ]
    });

  const first = new SceneFingerprint({
    narrativeContext: firstContext,
    promptVersion: "scene-v1"
  });
  const second = new SceneFingerprint({
    narrativeContext: secondContext,
    promptVersion: "scene-v1"
  });

  assert.strictEqual(
    first.value,
    second.value
  );
});

test("Defaults missing visible collections", () => {
  const context = createNarrativeContext();

  delete context.visibleCharacters;
  delete context.visibleItems;
  delete context.visibleObjects;
  delete context.visibleShops;

  const fingerprint = new SceneFingerprint({
    narrativeContext: context,
    promptVersion: "scene-v1"
  });

  assert.match(
    fingerprint.value,
    /^[a-f0-9]{64}$/
  );
});

test("Rejects an invalid narrative context", () => {
  assert.throws(
    () => new SceneFingerprint({
      narrativeContext: null,
      promptVersion: "scene-v1"
    }),
    /narrativeContext must be an object/
  );
});

test("Rejects missing world context", () => {
  const context = createNarrativeContext();
  delete context.world;

  assert.throws(
    () => new SceneFingerprint({
      narrativeContext: context,
      promptVersion: "scene-v1"
    }),
    /narrativeContext.world must be an object/
  );
});

test("Rejects missing location context", () => {
  const context = createNarrativeContext();
  delete context.location;

  assert.throws(
    () => new SceneFingerprint({
      narrativeContext: context,
      promptVersion: "scene-v1"
    }),
    /narrativeContext.location must be an object/
  );
});

test("Rejects an invalid prompt version", () => {
  assert.throws(
    () => new SceneFingerprint({
      narrativeContext:
        createNarrativeContext(),
      promptVersion: " "
    }),
    /promptVersion must be a non-empty string/
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
