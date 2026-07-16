"use strict";

const assert = require("assert");

const {
  createCharacterCreationRenderer,
  formatLabel,
  parseAttributeInput,
  parseSkillInput,
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

function createController({
  initialView,
  afterNameView,
  afterAttributeView,
  afterSkillView,
  afterNextView
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

      if (
        currentView.stage === "name" &&
        afterNameView
      ) {
        currentView = afterNameView;
      } else if (
        currentView.stage === "attributes" &&
        afterAttributeView
      ) {
        currentView = afterAttributeView;
      } else if (
        currentView.stage === "skills" &&
        afterSkillView
      ) {
        currentView = afterSkillView;
      }

      return currentView;
    },

    next() {
      calls.push({
        method: "next"
      });

      if (afterNextView) {
        currentView = afterNextView;
      } else if (
        currentView.stage === "name" &&
        afterNameView
      ) {
        currentView = afterNameView;
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
        cancelled: true,
        draftId: "draft-1",
        revision: 1
      };
    },

    isActive() {
      return active;
    }
  };
}

function createNameView() {
  return {
    stage: "name",
    stageNumber: 1,
    stageCount: 6,
    title: "Name",
    description:
      "Choose your character's name.",
    values: {
      name: ""
    },
    canMoveNext: false,
    canMovePrevious: false
  };
}

function createAttributeView({
  remainingPoints = 2,
  canMoveNext = false
} = {}) {
  return {
    stage: "attributes",
    stageNumber: 2,
    stageCount: 6,
    title: "Attributes",
    description:
      "Allocate your attribute points.",
    values: {
      body: 4,
      reflexes: 5
    },
    rules: {
      minimum: 2,
      maximum: 8,
      totalBudget: 11
    },
    allocatedPoints: 9,
    remainingPoints,
    canMoveNext,
    canMovePrevious: true
  };
}

function createSkillView({
  remainingPoints = 3,
  canMoveNext = false
} = {}) {
  return {
    stage: "skills",
    stageNumber: 3,
    stageCount: 6,
    title: "Skills",
    description:
      "Allocate your skill points.",
    values: {
      athletics: 3,
      awareness: 2
    },
    options: [
      {
        id: "athletics",
        name: "Athletics"
      },
      {
        id: "awareness",
        name: "Awareness"
      }
    ],
    rules: {
      minimum: 0,
      maximum: 6,
      totalBudget: 8
    },
    allocatedPoints: 5,
    remainingPoints,
    canMoveNext,
    canMovePrevious: true
  };
}

test(
  "Formats internal identifiers for display",
  () => {
    assert.strictEqual(
      formatLabel("combat_awareness"),
      "Combat Awareness"
    );

    assert.strictEqual(
      formatLabel("hand-eye_coordination"),
      "Hand Eye Coordination"
    );
  }
);

test(
  "Parses an attribute update",
  () => {
    assert.deepStrictEqual(
      parseAttributeInput("Body 7"),
      {
        attributeId: "body",
        value: 7
      }
    );
  }
);

test(
  "Rejects malformed attribute input",
  () => {
    assert.strictEqual(
      parseAttributeInput("body"),
      null
    );

    assert.strictEqual(
      parseAttributeInput("body seven"),
      null
    );
  }
);

test(
  "Parses a skill update",
  () => {
    assert.deepStrictEqual(
      parseSkillInput("Athletics 4"),
      {
        skillId: "athletics",
        value: 4
      }
    );
  }
);

test(
  "Rejects malformed skill input",
  () => {
    assert.strictEqual(
      parseSkillInput("athletics"),
      null
    );

    assert.strictEqual(
      parseSkillInput("athletics four"),
      null
    );
  }
);

test(
  "Renders the name stage",
  () => {
    const output =
      renderView(createNameView());

    assert.match(
      output,
      /BLACKWALL RUNNER/
    );

    assert.match(
      output,
      /Step 1 of 6/
    );

    assert.match(
      output,
      /Current name: <not entered>/
    );
  }
);

test(
  "Renders attribute values and remaining points",
  () => {
    const output =
      renderView(createAttributeView());

    assert.match(
      output,
      /Body/
    );

    assert.match(
      output,
      /Reflexes/
    );

    assert.match(
      output,
      /Remaining points: 2/
    );
  }
);

test(
  "Renders skill values and remaining points",
  () => {
    const output =
      renderView(createSkillView());

    assert.match(
      output,
      /Athletics/
    );

    assert.match(
      output,
      /Awareness/
    );

    assert.match(
      output,
      /Remaining points: 3/
    );
  }
);

test(
  "Submits a name and automatically advances",
  async () => {
    const nameView = createNameView();
    const attributeView =
      createAttributeView();

    const controller = createController({
      initialView: nameView,
      afterNameView: attributeView
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

    const result = await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    assert.strictEqual(
      result.status,
      "cancelled"
    );

    assert.deepStrictEqual(
      controller.calls[0],
      {
        method: "start",
        input: {
          ownerId: "player-1",
          platform: "cli"
        }
      }
    );

    assert.deepStrictEqual(
      controller.calls[1],
      {
        method: "submit",
        input: {
          value: "Naoko"
        }
      }
    );

    assert.strictEqual(
      controller.calls[2].method,
      "next"
    );

    assert.ok(
      output.some((message) =>
        message.includes(
          "Character creation closed"
        )
      )
    );
  }
);

test(
  "Submits an attribute update",
  async () => {
    const attributeView =
      createAttributeView();

    const controller = createController({
      initialView: attributeView,
      afterAttributeView: attributeView
    });

    const inputs = [
      "body 6",
      "quit"
    ];

    const renderer =
      createCharacterCreationRenderer({
        controller,

        async readInput() {
          return inputs.shift();
        },

        writeOutput() {}
      });

    await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    const submission =
      controller.calls.find(
        (call) =>
          call.method === "submit"
      );

    assert.deepStrictEqual(
      submission,
      {
        method: "submit",
        input: {
          attributeId: "body",
          value: 6
        }
      }
    );
  }
);

test(
  "Submits a skill update",
  async () => {
    const skillView =
      createSkillView();

    const controller = createController({
      initialView: skillView,
      afterSkillView: skillView
    });

    const inputs = [
      "athletics 4",
      "quit"
    ];

    const renderer =
      createCharacterCreationRenderer({
        controller,

        async readInput() {
          return inputs.shift();
        },

        writeOutput() {}
      });

    await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    const submission =
      controller.calls.find(
        (call) =>
          call.method === "submit"
      );

    assert.deepStrictEqual(
      submission,
      {
        method: "submit",
        input: {
          skillId: "athletics",
          value: 4
        }
      }
    );
  }
);

test(
  "Prevents NEXT when skill points remain",
  async () => {
    const skillView =
      createSkillView({
        remainingPoints: 3,
        canMoveNext: false
      });

    const controller = createController({
      initialView: skillView
    });

    const inputs = [
      "next",
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
      controller.calls.some(
        (call) => call.method === "next"
      ),
      false
    );

    assert.ok(
      output.some((message) =>
        message.includes(
          "All skill points must be allocated"
        )
      )
    );
  }
);

test(
  "Prevents NEXT when attribute points remain",
  async () => {
    const attributeView =
      createAttributeView({
        remainingPoints: 2,
        canMoveNext: false
      });

    const controller = createController({
      initialView: attributeView
    });

    const inputs = [
      "next",
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
      controller.calls.some(
        (call) => call.method === "next"
      ),
      false
    );

    assert.ok(
      output.some((message) =>
        message.includes(
          "All attribute points must be allocated"
        )
      )
    );
  }
);

async function run() {
  let passed = 0;
  let failed = 0;

  console.log(
    "================================"
  );
  console.log(
    "CHARACTER CREATION RENDERER TESTS"
  );
  console.log(
    "================================"
  );

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