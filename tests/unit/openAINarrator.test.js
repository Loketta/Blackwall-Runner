"use strict";

const assert = require("assert");
const {
  NarrationRequest
} = require("../../src/game/ai/narrationRequest");
const {
  OpenAINarrator
} = require("../../src/game/ai/openAINarrator");

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

function createRequest() {
  return new NarrationRequest({
    playerInput: "I check the alley.",
    mode: "describe_location",
    narrativeContext: {
      world: {
        weather: "light rain"
      },
      player: {
        name: "Runner"
      },
      location: {
        name: "Back Alley"
      }
    }
  });
}

function createNarrator(tracker = {}) {
  const prompt = {
    systemPrompt: "System narration rules.",
    userPrompt: "Structured game context."
  };

  return {
    narrator: new OpenAINarrator({
      client: {
        responses: {
          async create(options) {
            tracker.responseOptions = options;

            return {
              output_text:
                "  Rain glistens across the alley.  "
            };
          }
        }
      },
      promptBuilder: {
        build(request) {
          tracker.promptRequest = request;
          return prompt;
        }
      },
      model: "test-model"
    }),
    prompt
  };
}

async function run() {
  console.log("================================");
  console.log("OPENAI NARRATOR TESTS");
  console.log("================================");
  console.log("");

  await test("Builds a prompt from the narration request", async () => {
    const tracker = {};
    const request = createRequest();
    const { narrator } = createNarrator(tracker);

    await narrator.narrate(request);

    assert.strictEqual(
      tracker.promptRequest,
      request
    );
  });

  await test("Calls the Responses API", async () => {
    const tracker = {};
    const { narrator, prompt } =
      createNarrator(tracker);

    await narrator.narrate(createRequest());

    assert.deepStrictEqual(
      tracker.responseOptions,
      {
        model: "test-model",
        instructions: prompt.systemPrompt,
        input: prompt.userPrompt
      }
    );
  });

  await test("Returns narration metadata", async () => {
    const { narrator } = createNarrator();

    const result = await narrator.narrate(
      createRequest()
    );

    assert.deepStrictEqual(result, {
      narration:
        "Rain glistens across the alley.",
      mode: "describe_location",
      source: "openai",
      proposedAction: null
    });
  });

  await test("Returns an immutable result", async () => {
    const { narrator } = createNarrator();
    const result = await narrator.narrate(
      createRequest()
    );

    assert.strictEqual(
      Object.isFrozen(result),
      true
    );

    assert.throws(
      () => {
        result.source = "changed";
      },
      TypeError
    );
  });

  await test("Rejects an invalid narration request", async () => {
    const { narrator } = createNarrator();

    await assert.rejects(
      () => narrator.narrate({}),
      /requires a NarrationRequest/
    );
  });

  await test("Rejects an empty API response", async () => {
    const narrator = new OpenAINarrator({
      client: {
        responses: {
          async create() {
            return {
              output_text: "   "
            };
          }
        }
      },
      promptBuilder: {
        build() {
          return {
            systemPrompt: "System.",
            userPrompt: "User."
          };
        }
      },
      model: "test-model"
    });

    await assert.rejects(
      () => narrator.narrate(createRequest()),
      /response.output_text must be a non-empty string/
    );
  });

  await test("Rejects invalid constructor services", async () => {
    assert.throws(
      () => new OpenAINarrator({
        client: {},
        promptBuilder: {
          build() {}
        },
        model: "test-model"
      }),
      /responses.create function/
    );

    assert.throws(
      () => new OpenAINarrator({
        client: {
          responses: {
            create() {}
          }
        },
        promptBuilder: {},
        model: "test-model"
      }),
      /promptBuilder must provide a build function/
    );

    assert.throws(
      () => new OpenAINarrator({
        client: {
          responses: {
            create() {}
          }
        },
        promptBuilder: {
          build() {}
        },
        model: ""
      }),
      /model must be a non-empty string/
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
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
