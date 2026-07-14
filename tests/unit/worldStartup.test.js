"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL ${name}`);
    console.error(error);
    failed += 1;
  }
}

function withTemporaryRuntime(testFunction) {
  const runtimeDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "blackwall-startup-")
  );

  try {
    testFunction(runtimeDirectory);
  } finally {
    fs.rmSync(runtimeDirectory, {
      recursive: true,
      force: true
    });
  }
}

function runApplication(runtimeDirectory) {
  const indexPath = path.resolve(
    __dirname,
    "../../src/index.js"
  );

  return spawnSync(
    process.execPath,
    [indexPath, "__startup_smoke_test__"],
    {
      cwd: runtimeDirectory,
      encoding: "utf8",
      env: {
        ...process.env,
        AI_PROVIDER: "mock"
      }
    }
  );
}

function getWorldFilePath(runtimeDirectory) {
  return path.join(
    runtimeDirectory,
    "saves",
    "worlds",
    "development-world",
    "world.json"
  );
}

console.log("================================");
console.log("WORLD STARTUP TESTS");
console.log("================================");
console.log("");

test(
  "Starts the application with a development world",
  () => {
    withTemporaryRuntime((runtimeDirectory) => {
      const result = runApplication(runtimeDirectory);

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      assert.strictEqual(
        fs.existsSync(
          getWorldFilePath(runtimeDirectory)
        ),
        true
      );
    });
  }
);

test(
  "Creates valid development world metadata",
  () => {
    withTemporaryRuntime((runtimeDirectory) => {
      const result = runApplication(runtimeDirectory);

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const world = JSON.parse(
        fs.readFileSync(
          getWorldFilePath(runtimeDirectory),
          "utf8"
        )
      );

      assert.strictEqual(
        world.worldId,
        "development-world"
      );

      assert.strictEqual(
        world.name,
        "Development World"
      );

      assert.strictEqual(
        world.templateId,
        "cyberpunk-default"
      );

      assert.strictEqual(
        world.currentCampaignId,
        null
      );

      assert.strictEqual(
        world.status,
        "active"
      );

      assert.strictEqual(
        Number.isNaN(Date.parse(world.createdAt)),
        false
      );
    });
  }
);

test(
  "Reuses the existing development world",
  () => {
    withTemporaryRuntime((runtimeDirectory) => {
      const firstResult =
        runApplication(runtimeDirectory);

      assert.strictEqual(
        firstResult.status,
        0,
        firstResult.stderr
      );

      const filePath =
        getWorldFilePath(runtimeDirectory);

      const firstWorld = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      const secondResult =
        runApplication(runtimeDirectory);

      assert.strictEqual(
        secondResult.status,
        0,
        secondResult.stderr
      );

      const secondWorld = JSON.parse(
        fs.readFileSync(filePath, "utf8")
      );

      assert.deepStrictEqual(
        secondWorld,
        firstWorld
      );
    });
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
