"use strict";

const assert = require("assert");

const {
  createCharacterCreationRenderer,
  parseProfessionChoiceInput,
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

function createProfessionChoiceView({
  value = null,
  canMoveNext = false
} = {}) {
  return {
    stage: "profession_choices",
    stageNumber: 5,
    stageCount: 6,
    title: "Profession Choices",
    description:
      "Complete the choices required by your profession.",
    values: {
      weapon_type: value
    },
    choices: [
      {
        id: "weapon_type",
        type: "weapon_type",
        required: true,
        minimumSelections: 1,
        maximumSelections: 1,
        value,
        options: [
          {
            id: "pistol",
            name: "Pistol",
            category: "ranged"
          },
          {
            id: "rifle",
            name: "Rifle",
            category: "ranged"
          },
          {
            id: "blade",
            name: "Blade",
            category: "melee"
          }
        ]
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

      view = createProfessionChoiceView({
        value: input.value,
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
  "Parses a profession choice number",
  () => {
    const view =
      createProfessionChoiceView();

    assert.deepStrictEqual(
      parseProfessionChoiceInput(
        "2",
        view.choices[0]
      ),
      {
        choiceId: "weapon_type",
        value: "rifle"
      }
    );
  }
);

test(
  "Parses a profession choice identifier",
  () => {
    const view =
      createProfessionChoiceView();

    assert.deepStrictEqual(
      parseProfessionChoiceInput(
        "BLADE",
        view.choices[0]
      ),
      {
        choiceId: "weapon_type",
        value: "blade"
      }
    );
  }
);

test(
  "Rejects an unknown profession choice",
  () => {
    const view =
      createProfessionChoiceView();

    assert.strictEqual(
      parseProfessionChoiceInput(
        "99",
        view.choices[0]
      ),
      null
    );

    assert.strictEqual(
      parseProfessionChoiceInput(
        "cannon",
        view.choices[0]
      ),
      null
    );
  }
);

test(
  "Renders weapon type options",
  () => {
    const output = renderView(
      createProfessionChoiceView()
    );

    assert.match(
      output,
      /Weapon Type \[required\]/
    );

    assert.match(
      output,
      /1\. Pistol/
    );

    assert.match(
      output,
      /2\. Rifle/
    );

    assert.match(
      output,
      /3\. Blade/
    );
  }
);

test(
  "Highlights the selected weapon type",
  () => {
    const output = renderView(
      createProfessionChoiceView({
        value: "rifle",
        canMoveNext: true
      })
    );

    assert.match(
      output,
      /Current selection: Rifle/
    );

    assert.match(
      output,
      /Rifle \[selected\]/
    );

    assert.match(
      output,
      /NEXT\s+Continue/
    );

    assert.doesNotMatch(
      output,
      /Continue when this step is complete/
    );
  }
);

test(
  "Submits an operator weapon type",
  async () => {
    const controller =
      createController(
        createProfessionChoiceView()
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
          choiceId: "weapon_type",
          value: "rifle"
        }
      }
    );
  }
);

test(
  "Prevents NEXT before choosing a weapon type",
  async () => {
    const controller =
      createController(
        createProfessionChoiceView()
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
          "All required profession choices"
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
    "CHARACTER CREATION PROFESSION CHOICE TESTS"
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
