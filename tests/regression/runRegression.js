const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

const projectRoot = path.resolve(__dirname, "..", "..");
const entryPoint = path.join(projectRoot, "src", "index.js");
const liveDataPath = path.join(projectRoot, "data");
const fixtureDataPath = path.join(
  projectRoot,
  "tests",
  "fixtures",
  "regression-data"
);

const tests = [
  {
    name: "Player status",
    args: ["status"],
    expectedText: "PLAYER STATUS"
  },
  {
    name: "Location description",
    args: ["look"],
    expectedText: "Exits:"
  },
  {
    name: "Player inventory",
    args: ["inventory"],
    expectedText: "INVENTORY"
  },
  {
    name: "Shop listing",
    args: ["shop"],
    expectedText: "Kuroda Mart"
  },
  {
    name: "NPC dialogue",
    args: ["talk", "Finch"],
    expectedText: "Finch"
  },
  {
    name: "Open container",
    args: ["open", "Alley Crate"],
    expectedText: "Alley Crate"
  },
  {
    name: "Take item from container",
    args: [
      "take",
      "Protein Bar",
      "from",
      "Alley Crate"
    ],
    expectedText: "Protein Bar"
  },
  {
    name: "Drop item",
    args: ["drop", "Protein Bar"],
    expectedText: "Protein Bar"
  },
  {
    name: "Advance world time",
    args: ["wait", "1"],
    expectedText: "Time:"
  },
  {
    name: "Status after time advancement",
    args: ["status"],
    expectedText: "PLAYER STATUS"
  }
];

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

function runTest(test) {
  const result = spawnSync(
    process.execPath,
    [entryPoint, ...test.args],
    {
      cwd: projectRoot,
      encoding: "utf8"
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

function printResult(result) {
  const label = result.passed ? "PASS" : "FAIL";

  console.log(
    `${label.padEnd(5)} ${result.name}`
  );

  if (!result.passed) {
    console.log(
      `      Command: node src/index.js ${result.args.join(" ")}`
    );

    console.log(
      `      Expected output containing: ${result.expectedText}`
    );

    console.log(
      `      Exit code: ${result.status}`
    );

    if (result.stdout.trim()) {
      console.log("");
      console.log("      Standard output:");
      console.log(
        result.stdout
          .trim()
          .split("\n")
          .map((line) => `      ${line}`)
          .join("\n")
      );
    }

    if (result.stderr.trim()) {
      console.log("");
      console.log("      Error output:");
      console.log(
        result.stderr
          .trim()
          .split("\n")
          .map((line) => `      ${line}`)
          .join("\n")
      );
    }

    console.log("");
  }
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
}

function runRegressionSuite() {
  validatePaths();

  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "blackwall-runner-regression-")
  );

  const backupDataPath = path.join(
    temporaryDirectory,
    "data"
  );

  let failedCount = 0;

  console.log("================================");
  console.log("BLACKWALL RUNNER REGRESSION TESTS");
  console.log("================================");
  console.log("");

  try {
    console.log("Backing up live game data...");
    copyDirectory(liveDataPath, backupDataPath);

    console.log("Loading regression fixture...");
    replaceDirectory(fixtureDataPath, liveDataPath);

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

    if (fs.existsSync(backupDataPath)) {
      replaceDirectory(backupDataPath, liveDataPath);
    }

    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true
    });

    console.log("Live game data restored.");
  }

  const passedCount = tests.length - failedCount;

  console.log("");
  console.log("================================");
  console.log(`${passedCount} passed`);
  console.log(`${failedCount} failed`);
  console.log("================================");

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
