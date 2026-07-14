"use strict";

const assert = require("assert");
const {
  createInteractiveCli,
  parseCommandLine
} = require(
  "../../src/application/interactiveCli"
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

function createInterfaceStub() {
  const handlers = {};
  const tracker = {
    promptCount: 0,
    closeCount: 0
  };

  return {
    handlers,
    tracker,

    interfaceInstance: {
      on(eventName, handler) {
        handlers[eventName] = handler;
      },

      prompt() {
        tracker.promptCount += 1;
      },

      close() {
        tracker.closeCount += 1;

        if (handlers.close) {
          handlers.close();
        }
      }
    }
  };
}

async function runTests() {
  console.log("================================");
  console.log("INTERACTIVE CLI TESTS");
  console.log("================================");
  console.log("");

  await test(
    "Parses a command and arguments",
    async () => {
      assert.deepStrictEqual(
        parseCommandLine(
          "take Protein Bar from Alley Crate"
        ),
        {
          command: "take",
          args: [
            "Protein",
            "Bar",
            "from",
            "Alley",
            "Crate"
          ]
        }
      );
    }
  );

  await test(
    "Parses blank input",
    async () => {
      assert.deepStrictEqual(
        parseCommandLine("   "),
        {
          command: "",
          args: []
        }
      );
    }
  );

  await test(
    "Uses one shared service container",
    async () => {
      const calls = [];
      const interfaceStub =
        createInterfaceStub();

      const applicationServices = {
        presentationPipeline: {
          async present() {},
          getMetrics() {
            return {};
          }
        }
      };

      const cli = createInteractiveCli({
        async handleCommand(
          command,
          args,
          services
        ) {
          calls.push({
            command,
            args,
            services
          });
        },

        applicationServices,

        log() {},

        createInterface() {
          return interfaceStub.interfaceInstance;
        }
      });

      cli.start();

      await interfaceStub.handlers.line(
        "look"
      );

      await interfaceStub.handlers.line(
        "metrics"
      );

      assert.strictEqual(
        calls[0].services.presentationPipeline,
        applicationServices.presentationPipeline
      );

      assert.strictEqual(
        calls[1].services.presentationPipeline,
        applicationServices.presentationPipeline
      );
    }
  );

  await test(
    "Normalises command names",
    async () => {
      const calls = [];
      const interfaceStub =
        createInterfaceStub();

      const cli = createInteractiveCli({
        async handleCommand(command, args) {
          calls.push({
            command,
            args
          });
        },

        applicationServices: {},

        log() {},

        createInterface() {
          return interfaceStub.interfaceInstance;
        }
      });

      cli.start();

      await interfaceStub.handlers.line(
        "LoOk"
      );

      assert.deepStrictEqual(
        calls[0],
        {
          command: "look",
          args: []
        }
      );
    }
  );

  await test(
    "Ignores blank input",
    async () => {
      let commandCount = 0;
      const interfaceStub =
        createInterfaceStub();

      const cli = createInteractiveCli({
        async handleCommand() {
          commandCount += 1;
        },

        applicationServices: {},

        log() {},

        createInterface() {
          return interfaceStub.interfaceInstance;
        }
      });

      cli.start();

      await interfaceStub.handlers.line(
        "   "
      );

      assert.strictEqual(
        commandCount,
        0
      );
    }
  );

  await test(
    "Closes on quit",
    async () => {
      const interfaceStub =
        createInterfaceStub();

      const cli = createInteractiveCli({
        async handleCommand() {},

        applicationServices: {},

        log() {},

        createInterface() {
          return interfaceStub.interfaceInstance;
        }
      });

      cli.start();

      await interfaceStub.handlers.line(
        "quit"
      );

      assert.strictEqual(
        interfaceStub.tracker.closeCount,
        1
      );
    }
  );

  await test(
    "Prints command failures and continues",
    async () => {
      const messages = [];
      const interfaceStub =
        createInterfaceStub();

      const cli = createInteractiveCli({
        async handleCommand() {
          throw new Error("Boom");
        },

        applicationServices: {},

        log(message) {
          messages.push(message);
        },

        createInterface() {
          return interfaceStub.interfaceInstance;
        }
      });

      cli.start();

      await interfaceStub.handlers.line(
        "look"
      );

      assert.ok(
        messages.includes(
          "Command failed: Boom"
        )
      );

      assert.ok(
        interfaceStub.tracker.promptCount >= 2
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
