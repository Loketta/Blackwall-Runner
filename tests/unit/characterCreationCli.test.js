"use strict";

const assert = require("assert");

const {
  createCharacterDraft
} = require("../../src/game/characterCreation/characterDraft");

const {
  formatDraft,
  formatValidation,
  createCharacterCreationCli
} = require("../../src/cli/characterCreationCli");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

function createMockApplication() {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "developer",
    platform: "cli",
    worldId: "test-world"
  });

  return {
    draft,

    startOrResume() {
      return {
        created: true,
        draft: this.draft,
        validation: {
          valid: false,
          errors: []
        }
      };
    },

    setName({
      draft: suppliedDraft,
      name
    }) {
      this.draft = {
        ...suppliedDraft,
        revision:
          suppliedDraft.revision + 1,
        identity: {
          ...suppliedDraft.identity,
          name
        }
      };

      return {
        draft: this.draft,
        validation: {
          valid: false,
          errors: []
        }
      };
    },

    setAttribute() {
      throw new Error("Not used.");
    },

    setSkill() {
      throw new Error("Not used.");
    },

    setProfession() {
      throw new Error("Not used.");
    },

    setProfessionChoice() {
      throw new Error("Not used.");
    },

    validate() {
      return {
        valid: false,
        errors: [
          {
            code: "test_error",
            message: "Test validation error."
          }
        ]
      };
    },

    finalise() {
      return {
        created: true,
        character: {
          id: "character-1"
        },
        finalisedDraft: {
          ...this.draft,
          status: "finalised",
          revision:
            this.draft.revision + 1
        }
      };
    }
  };
}

function createOutput() {
  let content = "";

  return {
    write(value) {
      content += value;
    },

    read() {
      return content;
    }
  };
}

test("Formats a character draft", () => {
  const draft = createCharacterDraft({
    id: "draft-1",
    ownerId: "developer",
    platform: "cli",
    worldId: "test-world"
  });

  const formatted = formatDraft(draft);

  assert.strictEqual(
    formatted.includes("Draft ID: draft-1"),
    true
  );

  assert.strictEqual(
    formatted.includes("Points used: 14/42"),
    true
  );

  assert.strictEqual(
    formatted.includes("Points used: 0/24"),
    true
  );
});

test("Formats validation errors", () => {
  assert.strictEqual(
    formatValidation({
      valid: false,
      errors: [
        {
          code: "test_error",
          message: "Test message."
        }
      ]
    }),
    [
      "Character draft is not valid:",
      "- [test_error] Test message."
    ].join("\n")
  );
});

test("Starts a character draft", () => {
  const application =
    createMockApplication();

  const output = createOutput();

  const cli = createCharacterCreationCli({
    application,
    ownerId: "developer",
    input: {},
    output
  });

  cli.startOrResume();

  assert.strictEqual(
    cli.getCurrentDraft().id,
    "draft-1"
  );

  assert.strictEqual(
    output.read().includes(
      "Created draft draft-1."
    ),
    true
  );
});

test("Updates a name through the application", () => {
  const application =
    createMockApplication();

  const output = createOutput();

  const cli = createCharacterCreationCli({
    application,
    ownerId: "developer",
    input: {},
    output
  });

  cli.startOrResume();
  cli.handleCommand("name Naoko");

  assert.strictEqual(
    cli.getCurrentDraft().identity.name,
    "Naoko"
  );

  assert.strictEqual(
    cli.getCurrentDraft().revision,
    1
  );
});

test("Displays validation results", () => {
  const application =
    createMockApplication();

  const output = createOutput();

  const cli = createCharacterCreationCli({
    application,
    ownerId: "developer",
    input: {},
    output
  });

  cli.startOrResume();
  cli.handleCommand("validate");

  assert.strictEqual(
    output.read().includes(
      "Test validation error."
    ),
    true
  );
});

test("Finalises through the application", () => {
  const application =
    createMockApplication();

  const output = createOutput();

  const cli = createCharacterCreationCli({
    application,
    ownerId: "developer",
    input: {},
    output
  });

  cli.startOrResume();
  cli.handleCommand("finalise");

  assert.strictEqual(
    cli.getCurrentDraft().status,
    "finalised"
  );

  assert.strictEqual(
    output.read().includes(
      "Created character character-1."
    ),
    true
  );
});

test("Returns false for quit", () => {
  const cli = createCharacterCreationCli({
    application:
      createMockApplication(),
    ownerId: "developer",
    input: {},
    output: createOutput()
  });

  assert.strictEqual(
    cli.handleCommand("quit"),
    false
  );
});

async function run() {
  console.log("================================");
  console.log("CHARACTER CREATION CLI TESTS");
  console.log("================================");

  let passed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.callback();
      passed += 1;
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${tests.length - passed} failed`);
  console.log("================================");
}

run();