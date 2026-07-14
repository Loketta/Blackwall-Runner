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
    path.join(os.tmpdir(), "blackwall-player-state-")
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

function getPlayerStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "players",
    "runner.json"
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
console.log("PLAYER STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test("Seeds missing player state from the template", () => {
  withTemporarySaves((savesDirectory) => {
    const result = runNode(
      [
        'const { loadPlayer } = require("./src/game/managers/playerManager");',
        "loadPlayer();"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const playerStatePath =
      getPlayerStatePath(savesDirectory);

    const templatePath = path.resolve(
      __dirname,
      "../../data/players/runner.json"
    );

    assert.strictEqual(
      fs.existsSync(playerStatePath),
      true
    );

    assert.deepStrictEqual(
      JSON.parse(
        fs.readFileSync(playerStatePath, "utf8")
      ),
      JSON.parse(
        fs.readFileSync(templatePath, "utf8")
      )
    );
  });
});

test("Reuses existing player state", () => {
  withTemporarySaves((savesDirectory) => {
    const playerStatePath =
      getPlayerStatePath(savesDirectory);

    fs.mkdirSync(
      path.dirname(playerStatePath),
      { recursive: true }
    );

    const existingPlayer = {
      id: "player_runner_1",
      name: "Saved Runner",
      role: "Solo",
      health: 17,
      credits: 900,
      location: "safehouse_1",
      inventory: ["unity_pistol"]
    };

    fs.writeFileSync(
      playerStatePath,
      `${JSON.stringify(existingPlayer, null, 4)}\n`,
      "utf8"
    );

    const result = runNode(
      [
        'const { loadPlayer } = require("./src/game/managers/playerManager");',
        "const player = loadPlayer();",
        "process.stdout.write(JSON.stringify(player));"
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
      existingPlayer
    );

    assert.deepStrictEqual(
      JSON.parse(
        fs.readFileSync(playerStatePath, "utf8")
      ),
      existingPlayer
    );
  });
});

test("Saves changes to world-scoped player state", () => {
  withTemporarySaves((savesDirectory) => {
    const playerStatePath =
      getPlayerStatePath(savesDirectory);

    const templatePath = path.resolve(
      __dirname,
      "../../data/players/runner.json"
    );

    const templateBefore = fs.readFileSync(
      templatePath,
      "utf8"
    );

    const result = runNode(
      [
        'const { loadPlayer, savePlayer } = require("./src/game/managers/playerManager");',
        "const player = loadPlayer();",
        "player.health = 23;",
        "player.credits = 1250;",
        'player.location = "safehouse_1";',
        "savePlayer(player);"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const savedPlayer = JSON.parse(
      fs.readFileSync(playerStatePath, "utf8")
    );

    assert.strictEqual(savedPlayer.health, 23);
    assert.strictEqual(savedPlayer.credits, 1250);
    assert.strictEqual(
      savedPlayer.location,
      "safehouse_1"
    );

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
