const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");

const entryPoint = path.join(
  projectRoot,
  "src",
  "index.js"
);

const liveDataPath = path.join(
  projectRoot,
  "data"
);

const fixtureDataPath = path.join(
  projectRoot,
  "tests",
  "fixtures",
  "regression-data"
);

const testDefinitionsPath = path.join(
  __dirname,
  "commands.json"
);

function copyDirectory(sourcePath, destinationPath) {
  fs.cpSync(sourcePath, destinationPath, {
    recursive: true
  });
}

function replaceDirectory(sourcePath, destinationPath) {
  fs.rmSync(destinationPath, {
    recursive: true,
    force: true
  });

  copyDirectory(sourcePath, destinationPath);
}

function loadTestDefinitions() {
  let contents;

  try {
    contents = fs.readFileSync(
      testDefinitionsPath,
      "utf8"
    );
  } catch (error) {
    throw new Error(
      `Could not read regression definitions: ${error.message}`
    );
  }

  let tests;

  try {
    tests = JSON.parse(contents);
  } catch (error) {
    throw new Error(
      `Invalid JSON in commands.json: ${error.message}`
    );
  }

  validateTestDefinitions(tests);

  return tests;
}

function validateTestDefinitions(tests) {
  if (!Array.isArray(tests)) {
    throw new Error(
      "commands.json must contain an array of tests."
    );
  }

  if (tests.length === 0) {
    throw new Error(
      "commands.json must contain at least one test."
    );
  }

  tests.forEach(function (test, index) {
    const testNumber = index + 1;

    if (
      typeof test.name !== "string" ||
      test.name.trim() === ""
    ) {
      throw new Error(
        `Test ${testNumber} requires a non-empty name.`
      );
    }

    if (
      !Array.isArray(test.args) ||
      test.args.length === 0 ||
      !test.args.every(
        (argument) => typeof argument === "string"
      )
    ) {
      throw new Error(
        `Test "${test.name}" requires a string args array.`
      );
    }

    if (
      typeof test.expectedText !== "string" ||
      test.expectedText === ""
    ) {
      throw new Error(
        `Test "${test.name}" requires expectedText.`
      );
    }
  });
}

function validatePaths() {
  if (!fs.existsSync(entryPoint)) {
    throw new Error(
      "Application entry point not found: src/index.js"
    );
  }

  if (!fs.existsSync(liveDataPath)) {
    throw new Error(
      "Live data directory not found: data"
    );
  }

  if (!fs.existsSync(fixtureDataPath)) {
    throw new Error(
      "Regression fixture not found: " +
      "tests/fixtures/regression-data"
    );
  }

  if (!fs.existsSync(testDefinitionsPath)) {
    throw new Error(
      "Regression definitions not found: " +
      "tests/regression/commands.json"
    );
  }
}

function runTest(test) {
  const result = spawnSync(
    process.execPath,
    [entryPoint, ...test.args],
    {
      cwd: projectRoot,
      encoding: "utf8",
      env: {
        ...process.env,
        AI_PROVIDER: "mock"
      }
    }
  );

  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const combinedOutput = `${stdout}\n${stderr}`;

  const passed =
    result.status === 0 &&
    combinedOutput.includes(test.expectedText);

  return {
    ...test,
    passed,
    status: result.status,
    stdout,
    stderr
  };
}

function formatCommand(args) {
  return args
    .map(function (argument) {
      if (
        argument.includes(" ") ||
        argument.includes('"')
      ) {
        return `"${argument.replaceAll('"', '\\"')}"`;
      }

      return argument;
    })
    .join(" ");
}

function indentOutput(output) {
  return output
    .trim()
    .split(/\r?\n/)
    .map((line) => `      ${line}`)
    .join("\n");
}

function printResult(result) {
  const label = result.passed ? "PASS" : "FAIL";

  console.log(
    `${label.padEnd(5)} ${result.name}`
  );

  if (result.passed) {
    return;
  }

  console.log(
    "      Command: node src/index.js " +
    formatCommand(result.args)
  );

  console.log(
    "      Expected output containing: " +
    result.expectedText
  );

  console.log(
    `      Exit code: ${result.status}`
  );

  if (result.stdout.trim()) {
    console.log("");
    console.log("      Standard output:");
    console.log(indentOutput(result.stdout));
  }

  if (result.stderr.trim()) {
    console.log("");
    console.log("      Error output:");
    console.log(indentOutput(result.stderr));
  }

  console.log("");
}

function runRegressionSuite() {
  validatePaths();

  const tests = loadTestDefinitions();

  const temporaryDirectory = fs.mkdtempSync(
    path.join(
      os.tmpdir(),
      "blackwall-runner-regression-"
    )
  );

  const backupDataPath = path.join(
    temporaryDirectory,
    "data"
  );

  let failedCount = 0;
  let liveDataBackedUp = false;

  console.log(
    "================================"
  );

  console.log(
    "BLACKWALL RUNNER REGRESSION TESTS"
  );

  console.log(
    "================================"
  );

  console.log("");
  console.log(`Loaded ${tests.length} test definitions.`);

  try {
    console.log("Backing up live game data...");

    copyDirectory(
      liveDataPath,
      backupDataPath
    );

    liveDataBackedUp = true;

    console.log("Loading regression fixture...");

    replaceDirectory(
      fixtureDataPath,
      liveDataPath
    );

    console.log("Running tests...");
    console.log("");

    for (const test of tests) {
      const result = runTest(test);

      printResult(result);

      if (!result.passed) {
        failedCount += 1;
      }
    }
  } finally {
    console.log("");
    console.log("Restoring live game data...");

    if (
      liveDataBackedUp &&
      fs.existsSync(backupDataPath)
    ) {
      replaceDirectory(
        backupDataPath,
        liveDataPath
      );

      console.log("Live game data restored.");
    } else {
      console.error(
        "Live data was not replaced because " +
        "the backup did not complete."
      );
    }

    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true
    });
  }

  const passedCount =
    tests.length - failedCount;

  console.log("");
  console.log(
    "================================"
  );

  console.log(`${passedCount} passed`);
  console.log(`${failedCount} failed`);

  console.log(
    "================================"
  );

  if (failedCount > 0) {
    process.exitCode = 1;
  }
}

try {
  runRegressionSuite();
} catch (error) {
  console.error("");
  console.error("Regression suite failed:");
  console.error(error.message);
  process.exitCode = 1;
}
