"use strict";

const assert = require("assert");

const {
  CHARACTER_CREATION_STAGE,
  createCharacterCreationStageHandlers
} = require(
  "../../src/cli/characterCreationStageHandlers"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createController() {
  const calls = [];

  return {
    calls,

    submit(input) {
      calls.push({
        method: "submit",
        input
      });
    },

    next() {
      calls.push({
        method: "next"
      });
    },

    previous() {
      calls.push({
        method: "previous"
      });
    },

    finalise() {
      calls.push({
        method: "finalise"
      });
    },

    cancel() {
      calls.push({
        method: "cancel"
      });

      return {
        cancelled: true,
        draftId: "draft-1"
      };
    }
  };
}

function createHarness({
  input,
  renderedView = "RENDERED VIEW"
}) {
  const controller = createController();
  const outputs = [];
  const prompts = [];

  const handlers =
    createCharacterCreationStageHandlers({
      controller,

      async readInput(prompt) {
        prompts.push(prompt);

        return input;
      },

      writeOutput(message) {
        outputs.push(message);
      },

      renderView() {
        return renderedView;
      }
    });

  return {
    controller,
    handlers,
    outputs,
    prompts
  };
}

function createNameView() {
  return {
    stage: CHARACTER_CREATION_STAGE.NAME,
    canMoveNext: false,
    canMovePrevious: false
  };
}

function createAttributeView({
  canMoveNext = false
} = {}) {
  return {
    stage:
      CHARACTER_CREATION_STAGE.ATTRIBUTES,
    canMoveNext,
    canMovePrevious: true
  };
}

function createReviewView({
  readyToFinalise = true
} = {}) {
  return {
    stage: CHARACTER_CREATION_STAGE.REVIEW,
    canMoveNext: false,
    canMovePrevious: true,
    review: {
      readyToFinalise
    }
  };
}

test(
  "Uses the contextual Name prompt",
  async () => {
    const harness = createHarness({
      input: "Naoko"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.NAME
    ](createNameView());

    assert.deepStrictEqual(
      harness.prompts,
      ["Name> "]
    );
  }
);

test(
  "Rejects NEXT as a character name",
  async () => {
    const harness = createHarness({
      input: "NEXT"
    });

    const result =
      await harness.handlers[
        CHARACTER_CREATION_STAGE.NAME
      ](createNameView());

    assert.strictEqual(
      result.status,
      "continue"
    );

    assert.strictEqual(
      harness.controller.calls.some(
        (call) =>
          call.method === "submit"
      ),
      false
    );

    assert.strictEqual(
      harness.outputs.some(
        (message) =>
          message.includes(
            "'NEXT' is a reserved command"
          )
      ),
      true
    );
  }
);

test(
  "Rejects BACK as a character name",
  async () => {
    const harness = createHarness({
      input: "back"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.NAME
    ](createNameView());

    assert.strictEqual(
      harness.controller.calls.some(
        (call) =>
          call.method === "submit"
      ),
      false
    );

    assert.strictEqual(
      harness.outputs.some(
        (message) =>
          message.includes(
            "'BACK' is a reserved command"
          )
      ),
      true
    );
  }
);

test(
  "Rejects HELP as a character name",
  async () => {
    const harness = createHarness({
      input: "Help"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.NAME
    ](createNameView());

    assert.strictEqual(
      harness.controller.calls.some(
        (call) =>
          call.method === "submit"
      ),
      false
    );

    assert.strictEqual(
      harness.outputs.some(
        (message) =>
          message.includes(
            "'HELP' is a reserved command"
          )
      ),
      true
    );
  }
);

test(
  "Accepts an ordinary character name",
  async () => {
    const harness = createHarness({
      input: "Naoko"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.NAME
    ](createNameView());

    assert.deepStrictEqual(
      harness.controller.calls,
      [
        {
          method: "submit",
          input: {
            value: "Naoko"
          }
        },
        {
          method: "next"
        }
      ]
    );
  }
);

test(
  "Uses the contextual Attributes prompt",
  async () => {
    const harness = createHarness({
      input: "invalid"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ](createAttributeView());

    assert.deepStrictEqual(
      harness.prompts,
      ["Attributes> "]
    );
  }
);

test(
  "Reports malformed attribute input",
  async () => {
    const harness = createHarness({
      input: "invalid"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ](createAttributeView());

    assert.strictEqual(
      harness.controller.calls.some(
        (call) =>
          call.method === "submit"
      ),
      false
    );

    assert.strictEqual(
      harness.outputs.some(
        (message) =>
          message.includes(
            "Enter an attribute followed by a whole number"
          )
      ),
      true
    );
  }
);

test(
  "Submits a valid attribute update",
  async () => {
    const harness = createHarness({
      input: "Force 6"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.ATTRIBUTES
    ](createAttributeView());

    assert.deepStrictEqual(
      harness.controller.calls,
      [
        {
          method: "submit",
          input: {
            attributeId: "force",
            value: 6
          }
        }
      ]
    );
  }
);

test(
  "Cancels character creation on QUIT",
  async () => {
    const harness = createHarness({
      input: "quit"
    });

    const result =
      await harness.handlers[
        CHARACTER_CREATION_STAGE.NAME
      ](createNameView());

    assert.strictEqual(
      result.status,
      "cancelled"
    );

    assert.deepStrictEqual(
      harness.controller.calls,
      [
        {
          method: "cancel"
        }
      ]
    );
  }
);

test(
  "Finalises a valid review",
  async () => {
    const harness = createHarness({
      input: "finalise"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.REVIEW
    ](
      createReviewView({
        readyToFinalise: true
      })
    );

    assert.deepStrictEqual(
      harness.prompts,
      ["Review> "]
    );

    assert.deepStrictEqual(
      harness.controller.calls,
      [
        {
          method: "finalise"
        }
      ]
    );
  }
);

test(
  "Blocks finalisation when review is invalid",
  async () => {
    const harness = createHarness({
      input: "finalise"
    });

    await harness.handlers[
      CHARACTER_CREATION_STAGE.REVIEW
    ](
      createReviewView({
        readyToFinalise: false
      })
    );

    assert.strictEqual(
      harness.controller.calls.some(
        (call) =>
          call.method === "finalise"
      ),
      false
    );

    assert.strictEqual(
      harness.outputs.some(
        (message) =>
          message.includes(
            "cannot be finalised"
          )
      ),
      true
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "CHARACTER CREATION STAGE HANDLER TESTS"
  );
  console.log(
    "================================"
  );

  let passed = 0;
  let failed = 0;

  for (const definition of tests) {
    try {
      await definition.callback();

      passed += 1;

      console.log(
        `PASS ${definition.name}`
      );
    } catch (error) {
      failed += 1;

      console.error(
        `FAIL ${definition.name}`
      );
      console.error(error);
    }
  }

  console.log(
    "================================"
  );
  console.log(`${passed} passed`);
  console.log(`${failed} failed`);
  console.log(
    "================================"
  );

  if (failed > 0) {
    process.exitCode = 1;
  }
}

run();
