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
    path.join(os.tmpdir(), "blackwall-event-state-")
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

function getEventStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "events",
    "events.json"
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
console.log("EVENT STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test("Seeds missing event state from the template", () => {
  withTemporarySaves((savesDirectory) => {
    const result = runNode(
      [
        'const { getEventServices } = require("./src/game/events/eventServices");',
        "getEventServices();"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const eventStatePath =
      getEventStatePath(savesDirectory);

    const templatePath = path.resolve(
      __dirname,
      "../../data/events/events.json"
    );

    assert.strictEqual(
      fs.existsSync(eventStatePath),
      true
    );

    assert.deepStrictEqual(
      JSON.parse(
        fs.readFileSync(eventStatePath, "utf8")
      ),
      JSON.parse(
        fs.readFileSync(templatePath, "utf8")
      )
    );
  });
});

test("Reuses existing event state", () => {
  withTemporarySaves((savesDirectory) => {
    const eventStatePath =
      getEventStatePath(savesDirectory);

    fs.mkdirSync(
      path.dirname(eventStatePath),
      { recursive: true }
    );

    const existingEvents = [
      {
        eventId: "event_existing",
        type: "TimePassed",
        worldTime: "2045-07-12T15:00:00",
        actorId: null,
        targetIds: [],
        locationId: null,
        visibility: "public",
        payload: {
          minutes: 15
        },
        parentEventId: null,
        causationId: null,
        metadata: {}
      }
    ];

    fs.writeFileSync(
      eventStatePath,
      `${JSON.stringify(existingEvents, null, 2)}\n`,
      "utf8"
    );

    const result = runNode(
      [
        'const { getEventServices } = require("./src/game/events/eventServices");',
        "const { eventHistory } = getEventServices();",
        "process.stdout.write(JSON.stringify(eventHistory.getAll()));"
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
      existingEvents
    );

    assert.deepStrictEqual(
      JSON.parse(
        fs.readFileSync(eventStatePath, "utf8")
      ),
      existingEvents
    );
  });
});

test("Saves changes to world-scoped event state", () => {
  withTemporarySaves((savesDirectory) => {
    const eventStatePath =
      getEventStatePath(savesDirectory);

    const templatePath = path.resolve(
      __dirname,
      "../../data/events/events.json"
    );

    const templateBefore = fs.readFileSync(
      templatePath,
      "utf8"
    );

    const result = runNode(
      [
        'const { getEventServices } = require("./src/game/events/eventServices");',
        "const { eventRecorder } = getEventServices();",
        "eventRecorder.record({",
        'type: "TimePassed",',
        'worldTime: "2045-07-12T15:00:00",',
        "payload: { minutes: 15 }",
        "});"
      ].join(" "),
      savesDirectory
    );

    assert.strictEqual(
      result.status,
      0,
      result.stderr
    );

    const savedEvents = JSON.parse(
      fs.readFileSync(eventStatePath, "utf8")
    );

    assert.strictEqual(savedEvents.length, 1);
    assert.strictEqual(
      savedEvents[0].type,
      "TimePassed"
    );
    assert.strictEqual(
      savedEvents[0].worldTime,
      "2045-07-12T15:00:00"
    );
    assert.deepStrictEqual(
      savedEvents[0].payload,
      { minutes: 15 }
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