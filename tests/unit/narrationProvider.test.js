"use strict";

const assert = require("assert");

const {
  NarrationRequest
} = require(
  "../../src/game/ai/narrationRequest"
);
const {
  NarrationCache
} = require(
  "../../src/game/presentation/narrationCache"
);
const {
  NarrationProvider
} = require(
  "../../src/game/presentation/narrationProvider"
);

let passed = 0;
let failed = 0;

async function test(name, testFunction) {
  try {
    await testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

function createNarrativeContext(
  overrides = {}
) {
  return {
    world: {
      weather: "light rain"
    },
    player: {
      id: "player_1",
      name: "Runner"
    },
    location: {
      id: "back_alley_1",
      name: "Back Alley",
      description:
        "A narrow service alley."
    },
    visibleCharacters: [],
    visibleItems: [],
    visibleObjects: [],
    visibleShops: [],
    recentEvents: [],
    ...overrides
  };
}

function createRequest({
  mode = "describe_location",
  narrativeContext =
    createNarrativeContext(),
  playerInput = "I look around."
} = {}) {
  return new NarrationRequest({
    playerInput,
    narrativeContext,
    mode,
    instructions: {}
  });
}

function createNarrator() {
  return {
    callCount: 0,

    async narrate(request) {
      this.callCount += 1;

      return Object.freeze({
        narration:
          "Rain glistens across the alley.",
        mode: request.mode,
        source: "openai",
        proposedAction: null
      });
    }
  };
}

function createProvider({
  narrator = createNarrator(),
  cache = new NarrationCache(),
  promptVersion = "scene-v1",
  model = "test-model",
  clock = () =>
    new Date(
      "2045-01-02T03:05:00.000Z"
    )
} = {}) {
  return new NarrationProvider({
    narrator,
    cache,
    promptVersion,
    model,
    clock
  });
}

async function runTests() {
  console.log("================================");
  console.log("NARRATION PROVIDER TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Calls the narrator on a location cache miss",
    async () => {
      const narrator = createNarrator();
      const provider = createProvider({
        narrator
      });

      const result = await provider.narrate(
        createRequest()
      );

      assert.strictEqual(
        narrator.callCount,
        1
      );
      assert.strictEqual(
        result.narration,
        "Rain glistens across the alley."
      );
    }
  );

  await test(
    "Stores location narration after a cache miss",
    async () => {
      const cache = new NarrationCache();
      const provider = createProvider({
        cache
      });

      await provider.narrate(
        createRequest()
      );

      assert.strictEqual(cache.size(), 1);
    }
  );

  await test(
    "Returns cached location narration",
    async () => {
      const narrator = createNarrator();
      const provider = createProvider({
        narrator
      });
      const request = createRequest();

      const firstResult =
        await provider.narrate(request);
      const secondResult =
        await provider.narrate(request);

      assert.strictEqual(
        narrator.callCount,
        1
      );
      assert.strictEqual(
        secondResult.narration,
        firstResult.narration
      );
      assert.strictEqual(
        secondResult.mode,
        "describe_location"
      );
      assert.strictEqual(
        secondResult.source,
        "openai"
      );
      assert.strictEqual(
        secondResult.proposedAction,
        null
      );
    }
  );

  await test(
    "Returns an immutable cached result",
    async () => {
      const provider = createProvider();
      const request = createRequest();

      await provider.narrate(request);

      const cachedResult =
        await provider.narrate(request);

      assert.strictEqual(
        Object.isFrozen(cachedResult),
        true
      );

      assert.throws(
        () => {
          cachedResult.narration =
            "Changed.";
        },
        TypeError
      );
    }
  );

  await test(
    "Calls the narrator when the visible scene changes",
    async () => {
      const narrator = createNarrator();
      const provider = createProvider({
        narrator
      });

      await provider.narrate(
        createRequest()
      );

      await provider.narrate(
        createRequest({
          narrativeContext:
            createNarrativeContext({
              visibleCharacters: [
                {
                  id: "finch",
                  name: "Finch"
                }
              ]
            })
        })
      );

      assert.strictEqual(
        narrator.callCount,
        2
      );
    }
  );

  await test(
    "Reuses narration when excluded player state changes",
    async () => {
      const narrator = createNarrator();
      const provider = createProvider({
        narrator
      });

      await provider.narrate(
        createRequest()
      );

      await provider.narrate(
        createRequest({
          narrativeContext:
            createNarrativeContext({
              player: {
                id: "player_1",
                name: "Runner",
                health: 5
              }
            })
        })
      );

      assert.strictEqual(
        narrator.callCount,
        1
      );
    }
  );

  await test(
    "Does not cache action narration",
    async () => {
      const narrator = createNarrator();
      const cache = new NarrationCache();
      const provider = createProvider({
        narrator,
        cache
      });

      const request = createRequest({
        mode: "narrate_action",
        playerInput: "I open the crate."
      });

      await provider.narrate(request);
      await provider.narrate(request);

      assert.strictEqual(
        narrator.callCount,
        2
      );
      assert.strictEqual(
        cache.size(),
        0
      );
    }
  );

  await test(
    "Does not cache dialogue narration",
    async () => {
      const narrator = createNarrator();
      const cache = new NarrationCache();
      const provider = createProvider({
        narrator,
        cache
      });

      const request = createRequest({
        mode: "narrate_dialogue",
        playerInput: "I speak to Finch."
      });

      await provider.narrate(request);
      await provider.narrate(request);

      assert.strictEqual(
        narrator.callCount,
        2
      );
      assert.strictEqual(
        cache.size(),
        0
      );
    }
  );

  await test(
    "Propagates narrator failures without caching",
    async () => {
      const cache = new NarrationCache();

      const provider = createProvider({
        cache,
        narrator: {
          async narrate() {
            throw new Error(
              "Narration unavailable."
            );
          }
        }
      });

      await assert.rejects(
        () => provider.narrate(
          createRequest()
        ),
        /Narration unavailable/
      );

      assert.strictEqual(cache.size(), 0);
    }
  );

  await test(
    "Rejects an invalid narrator result",
    async () => {
      const provider = createProvider({
        narrator: {
          async narrate() {
            return {
              narration: "",
              source: "openai"
            };
          }
        }
      });

      await assert.rejects(
        () => provider.narrate(
          createRequest()
        ),
        /narrator result narration must be a non-empty string/
      );
    }
  );

  await test(
    "Rejects an invalid narration request",
    async () => {
      const provider = createProvider();

      await assert.rejects(
        () => provider.narrate({}),
        /NarrationProvider requires a NarrationRequest/
      );
    }
  );

  await test(
    "Rejects an invalid narrator service",
    async () => {
      assert.throws(
        () => createProvider({
          narrator: {}
        }),
        /narrator must provide narrate functions/
      );
    }
  );

  await test(
    "Rejects an invalid cache service",
    async () => {
      assert.throws(
        () => createProvider({
          cache: {}
        }),
        /cache must provide find and store functions/
      );
    }
  );

  await test(
    "Rejects an invalid prompt version",
    async () => {
      assert.throws(
        () => createProvider({
          promptVersion: " "
        }),
        /promptVersion must be a non-empty string/
      );
    }
  );

  await test(
    "Rejects an invalid model",
    async () => {
      assert.throws(
        () => createProvider({
          model: null
        }),
        /model must be a non-empty string/
      );
    }
  );

  await test(
    "Rejects an invalid clock",
    async () => {
      assert.throws(
        () => createProvider({
          clock: null
        }),
        /clock must be a function/
      );
    }
  );

  console.log("");
  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log("================================");

  if (failed > 0) {
    process.exitCode = 1;
  }
}

runTests().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
