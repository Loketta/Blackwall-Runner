"use strict";

const assert = require("assert");

const {
  createCharacterCreationRenderer,
  renderView
} = require(
  "../../src/cli/characterCreationRenderer"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createAttributeView({
  force = 2
} = {}) {
  return {
    stage: "attributes",
    stageNumber: 2,
    stageCount: 7,
    title: "Allocate Attributes",
    description:
      "Distribute points between your core attributes.",
    values: {
      force,
      agility: 2,
      dexterity: 2,
      intellect: 2,
      awareness: 2,
      will: 2,
      face: 2
    },
    rules: {
      minimum: 2,
      maximum: 8,
      totalBudget: 42
    },
    allocatedPoints:
      force + 12,
    remainingPoints:
      42 - (force + 12),
    canMoveNext: false,
    canMovePrevious: true
  };
}

function createNameView() {
  return {
    stage: "name",
    stageNumber: 1,
    stageCount: 7,
    title: "Choose Your Name",
    description:
      "Enter the name your character will use.",
    values: {
      name: ""
    },
    canMoveNext: false,
    canMovePrevious: false
  };
}

function createController({
  initialView,
  submittedView = null,
  nextView = null
}) {
  let active = true;
  let currentView = initialView;
  const calls = [];

  return {
    calls,

    start(input) {
      calls.push({
        method: "start",
        input
      });

      return currentView;
    },

    submit(input) {
      calls.push({
        method: "submit",
        input
      });

      if (submittedView) {
        currentView = submittedView;
      }

      return currentView;
    },

    next() {
      calls.push({
        method: "next"
      });

      if (nextView) {
        currentView = nextView;
      }

      return currentView;
    },

    previous() {
      calls.push({
        method: "previous"
      });

      return currentView;
    },

    renderCurrentStep() {
      calls.push({
        method: "renderCurrentStep"
      });

      return currentView;
    },

    finalise() {
      calls.push({
        method: "finalise"
      });

      return currentView;
    },

    cancel() {
      calls.push({
        method: "cancel"
      });

      active = false;

      return {
        cancelled: true
      };
    },

    isActive() {
      return active;
    }
  };
}

function countRenderedView(
  output,
  view
) {
  const expected = renderView(view);

  return output.filter(
    (message) => message === expected
  ).length;
}

test(
  "Suppresses duplicate redraws for unchanged views",
  async () => {
    const view = createAttributeView();
    const controller = createController({
      initialView: view
    });

    const inputs = [
      "invalid",
      "quit"
    ];

    const output = [];

    const renderer =
      createCharacterCreationRenderer({
        controller,

        async readInput() {
          return inputs.shift();
        },

        writeOutput(message) {
          output.push(message);
        }
      });

    const result = await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    assert.strictEqual(
      result.status,
      "cancelled"
    );

    assert.strictEqual(
      countRenderedView(output, view),
      1
    );

    assert.strictEqual(
      output.some(
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
  "Redraws after a displayed value changes",
  async () => {
    const initialView =
      createAttributeView({
        force: 2
      });

    const updatedView =
      createAttributeView({
        force: 6
      });

    const controller = createController({
      initialView,
      submittedView: updatedView
    });

    const inputs = [
      "force 6",
      "quit"
    ];

    const output = [];

    const renderer =
      createCharacterCreationRenderer({
        controller,

        async readInput() {
          return inputs.shift();
        },

        writeOutput(message) {
          output.push(message);
        }
      });

    await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    assert.strictEqual(
      countRenderedView(
        output,
        initialView
      ),
      1
    );

    assert.strictEqual(
      countRenderedView(
        output,
        updatedView
      ),
      1
    );
  }
);

test(
  "Redraws after moving to another stage",
  async () => {
    const nameView = createNameView();
    const attributeView =
      createAttributeView();

    const controller = createController({
      initialView: nameView,
      nextView: attributeView
    });

    const inputs = [
      "Naoko",
      "quit"
    ];

    const output = [];

    const renderer =
      createCharacterCreationRenderer({
        controller,

        async readInput() {
          return inputs.shift();
        },

        writeOutput(message) {
          output.push(message);
        }
      });

    await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    assert.strictEqual(
      countRenderedView(
        output,
        nameView
      ),
      1
    );

    assert.strictEqual(
      countRenderedView(
        output,
        attributeView
      ),
      1
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "CHARACTER CREATION RENDERER UX TESTS"
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
