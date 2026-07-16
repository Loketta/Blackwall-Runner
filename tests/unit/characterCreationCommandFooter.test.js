"use strict";

const assert = require("assert");

const {
  createCommandFooter,
  renderView
} = require(
  "../../src/cli/characterCreationViews"
);

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createBaseView(overrides = {}) {
  return {
    stageNumber: 1,
    stageCount: 7,
    title: "Test Stage",
    description: "Test description.",
    canMoveNext: false,
    canMovePrevious: false,
    ...overrides
  };
}

test(
  "Shows only QUIT on the name stage",
  () => {
    const footer = createCommandFooter(
      createBaseView({
        stage: "name"
      })
    ).join("\n");

    assert.match(footer, /QUIT/);
    assert.doesNotMatch(footer, /BACK/);
    assert.doesNotMatch(footer, /NEXT/);
    assert.doesNotMatch(footer, /FINALISE/);
  }
);

test(
  "Shows BACK NEXT and QUIT during allocation",
  () => {
    const footer = createCommandFooter(
      createBaseView({
        stage: "attributes",
        canMovePrevious: true,
        canMoveNext: false
      })
    ).join("\n");

    assert.match(footer, /BACK\s+Previous step/);
    assert.match(
      footer,
      /NEXT\s+Continue when this step is complete/
    );
    assert.match(
      footer,
      /QUIT\s+Save draft and exit/
    );
  }
);

test(
  "Shows NEXT as available when the step is complete",
  () => {
    const footer = createCommandFooter(
      createBaseView({
        stage: "skills",
        canMovePrevious: true,
        canMoveNext: true
      })
    ).join("\n");

    assert.match(
      footer,
      /NEXT\s+Continue/
    );

    assert.doesNotMatch(
      footer,
      /Continue when this step is complete/
    );
  }
);

test(
  "Shows FINALISE on the review stage",
  () => {
    const footer = createCommandFooter(
      createBaseView({
        stage: "review",
        canMovePrevious: true,
        review: {
          readyToFinalise: true
        }
      })
    ).join("\n");

    assert.match(
      footer,
      /FINALISE\s+Create this character/
    );
    assert.match(
      footer,
      /BACK\s+Previous step/
    );
    assert.match(
      footer,
      /QUIT\s+Save draft and exit/
    );
  }
);

test(
  "Shows unavailable finalisation status",
  () => {
    const footer = createCommandFooter(
      createBaseView({
        stage: "review",
        canMovePrevious: true,
        review: {
          readyToFinalise: false
        }
      })
    ).join("\n");

    assert.match(
      footer,
      /FINALISE\s+Available when validation is complete/
    );
  }
);

test(
  "Does not show a footer on the finished stage",
  () => {
    assert.deepStrictEqual(
      createCommandFooter(
        createBaseView({
          stage: "finished"
        })
      ),
      []
    );
  }
);

test(
  "Renders the centralized footer in a screen",
  () => {
    const output = renderView(
      createBaseView({
        stage: "name",
        values: {
          name: ""
        }
      })
    );

    assert.match(output, /Commands/);
    assert.match(
      output,
      /QUIT\s+Save draft and exit/
    );

    assert.doesNotMatch(
      output,
      /Type QUIT to save your draft and leave/
    );
  }
);

async function run() {
  console.log(
    "================================"
  );
  console.log(
    "CHARACTER CREATION COMMAND FOOTER TESTS"
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
