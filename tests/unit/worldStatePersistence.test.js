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

function withTemporarySaves(testFunction) {
  const temporaryDirectory = fs.mkdtempSync(
    path.join(os.tmpdir(), "blackwall-world-state-")
  );

  try {
    testFunction(temporaryDirectory);
  } finally {
    fs.rmSync(temporaryDirectory, {
      recursive: true,
      force: true
    });
  }
}

function getStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "world.json"
  );
}

function runNode(script, savesDirectory) {
  return spawnSync(
    process.execPath,
    ["-e", script],
    {
      cwd: path.resolve(__dirname, "../.."),
      encoding: "utf8",
      env: {
        ...process.env,
        BLACKWALL_SAVES_DIRECTORY: savesDirectory
      }
    }
  );
}

console.log("================================");
console.log("WORLD STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test("Seeds missing state from the template", () => {
  withTemporarySaves((savesDirectory) => {
    const result = runNode(
      [
        'const { loadWorld } = require("./src/game/managers/worldManager");',
        "loadWorld();"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const statePath = getStatePath(savesDirectory);
    const templatePath = path.resolve(
      __dirname,
      "../../data/World/world.json"
    );

    assert.strictEqual(
      fs.existsSync(statePath),
      true
    );

    assert.deepStrictEqual(
      JSON.parse(fs.readFileSync(statePath, "utf8")),
      JSON.parse(fs.readFileSync(templatePath, "utf8"))
    );
  });
});

test("Reuses existing world state", () => {
  withTemporarySaves((savesDirectory) => {
    const statePath = getStatePath(savesDirectory);

    fs.mkdirSync(
      path.dirname(statePath),
      { recursive: true }
    );

    const existingWorld = {
      day: 99,
      hour: 12,
      minute: 34,
      weather: "storm"
    };

    fs.writeFileSync(
      statePath,
      `${JSON.stringify(existingWorld, null, 2)}\n`,
      "utf8"
    );

    const result = runNode(
      [
        'const { loadWorld } = require("./src/game/managers/worldManager");',
        "const world = loadWorld();",
        "process.stdout.write(JSON.stringify(world));"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    assert.deepStrictEqual(
      JSON.parse(result.stdout),
      existingWorld
    );

    assert.deepStrictEqual(
      JSON.parse(fs.readFileSync(statePath, "utf8")),
      existingWorld
    );
  });
});

test("Saves changes to world-scoped state", () => {
  withTemporarySaves((savesDirectory) => {
    const statePath = getStatePath(savesDirectory);
    const templatePath = path.resolve(
      __dirname,
      "../../data/World/world.json"
    );

    const templateBefore = fs.readFileSync(
      templatePath,
      "utf8"
    );

    const result = runNode(
      [
        'const { loadWorld, saveWorld } = require("./src/game/managers/worldManager");',
        "const world = loadWorld();",
        "world.day = 42;",
        "world.hour = 7;",
        "world.minute = 15;",
        "saveWorld(world);"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const savedWorld = JSON.parse(
      fs.readFileSync(statePath, "utf8")
    );

    assert.strictEqual(savedWorld.day, 42);
    assert.strictEqual(savedWorld.hour, 7);
    assert.strictEqual(savedWorld.minute, 15);

    assert.strictEqual(
      fs.readFileSync(templatePath, "utf8"),
      templateBefore
    );
  });
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
