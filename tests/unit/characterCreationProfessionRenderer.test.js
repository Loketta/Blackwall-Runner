"use strict";

const assert = require("assert");

const {
  createCharacterCreationRenderer,
  parseProfessionInput,
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

function createProfessionView({
  professionId = null,
  canMoveNext = false
} = {}) {
  return {
    stage: "profession",
    stageNumber: 4,
    stageCount: 6,
    title: "Profession",
    description:
      "Choose your character's profession.",
    values: {
      professionId
    },
    options: [
      {
        id: "melee_specialist",
        name: "Melee Specialist",
        aptitudes: [
          "melee",
          "unarmed",
          "grapple"
        ],
        mastery: {
          name: "Monstrous",
          description:
            "A master of close combat."
        }
      },
      {
        id: "operator",
        name: "Operator",
        aptitudes: [
          "stealth",
          "explosives"
        ],
        mastery: {
          name: "Ghost",
          description:
            "Excels when attacking unaware targets."
        }
      }
    ],
    canMoveNext,
    canMovePrevious: true
  };
}

function createController(initialView) {
  let active = true;
  let view = initialView;
  const calls = [];

  return {
    calls,

    start(input) {
      calls.push({
        method: "start",
        input
      });

      return view;
    },

    submit(input) {
      calls.push({
        method: "submit",
        input
      });

      view = createProfessionView({
        professionId:
          input.professionId,
        canMoveNext: true
      });

      return view;
    },

    next() {
      calls.push({
        method: "next"
      });

      return view;
    },

    previous() {
      calls.push({
        method: "previous"
      });

      return view;
    },

    renderCurrentStep() {
      return view;
    },

    finalise() {
      return view;
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

test(
  "Parses a profession number",
  () => {
    const view =
      createProfessionView();

    assert.deepStrictEqual(
      parseProfessionInput(
        "2",
        view.options
      ),
      {
        professionId: "operator"
      }
    );
  }
);

test(
  "Parses a profession identifier",
  () => {
    const view =
      createProfessionView();

    assert.deepStrictEqual(
      parseProfessionInput(
        "MELEE_SPECIALIST",
        view.options
      ),
      {
        professionId:
          "melee_specialist"
      }
    );
  }
);

test(
  "Rejects an unknown profession",
  () => {
    const view =
      createProfessionView();

    assert.strictEqual(
      parseProfessionInput(
        "99",
        view.options
      ),
      null
    );

    assert.strictEqual(
      parseProfessionInput(
        "unknown",
        view.options
      ),
      null
    );
  }
);

test(
  "Renders profession options",
  () => {
    const output =
      renderView(createProfessionView());

    assert.match(
      output,
      /1\. Melee Specialist/
    );

    assert.match(
      output,
      /2\. Operator/
    );

    assert.match(
      output,
      /Mastery: Monstrous/
    );

    assert.match(
      output,
      /Mastery: Ghost/
    );
  }
);

test(
  "Highlights the selected profession",
  () => {
    const output = renderView(
      createProfessionView({
        professionId: "operator",
        canMoveNext: true
      })
    );

    assert.match(
      output,
      /Operator \[selected\]/
    );

    assert.match(
      output,
      /Type NEXT to continue/
    );
  }
);

test(
  "Submits a profession selection",
  async () => {
    const controller =
      createController(
        createProfessionView()
      );

    const inputs = [
      "2",
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

    const result = await renderer.run({
      ownerId: "player-1",
      platform: "cli"
    });

    assert.strictEqual(
      result.status,
      "cancelled"
    );

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
          professionId: "operator"
        }
      }
    );
  }
);

test(
  "Prevents NEXT without a profession",
  async () => {
    const controller =
      createController(
        createProfessionView()
      );

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
          "A profession must be selected"
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
    "CHARACTER CREATION PROFESSION RENDERER TESTS"
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