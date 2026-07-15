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
    path.join(
      os.tmpdir(),
      "blackwall-location-state-"
    )
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

function getLocationStatePath(
  savesDirectory,
  locationId
) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "locations",
    `${locationId}.json`
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
        BLACKWALL_SAVES_DIRECTORY:
          savesDirectory
      }
    }
  );
}

console.log("================================");
console.log("LOCATION STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test(
  "Seeds missing location state from mutable template fields",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadLocation } = require("./src/game/managers/locationManager");',
          'loadLocation("back_alley_1");'
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath = getLocationStatePath(
        savesDirectory,
        "back_alley_1"
      );

      assert.strictEqual(
        fs.existsSync(statePath),
        true
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        {
          id: "back_alley_1",
          items: [],
          npcs: ["finch"],
          objects: ["alley_crate"]
        }
      );
    });
  }
);

test(
  "Seeds missing mutable collections as empty arrays",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadLocation } = require("./src/game/managers/locationManager");',
          'loadLocation("safehouse_1");'
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath = getLocationStatePath(
        savesDirectory,
        "safehouse_1"
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        {
          id: "safehouse_1",
          items: [],
          npcs: [],
          objects: []
        }
      );
    });
  }
);

test(
  "Merges existing runtime state with authored template content",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath = getLocationStatePath(
        savesDirectory,
        "back_alley_1"
      );

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const existingState = {
        id: "back_alley_1",
        items: ["protein_bar"],
        npcs: [],
        objects: []
      };

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(existingState, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadLocation } = require("./src/game/managers/locationManager");',
          'const location = loadLocation("back_alley_1");',
          "process.stdout.write(JSON.stringify(location));"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const location = JSON.parse(
        result.stdout
      );

      assert.strictEqual(
        location.id,
        "back_alley_1"
      );
      assert.strictEqual(
        location.name,
        "Back Alley"
      );
      assert.strictEqual(
        location.type,
        "street"
      );
      assert.ok(
        location.description.includes(
          "service alley"
        )
      );
      assert.deepStrictEqual(
        location.exits,
        [
          {
            name: "safehouse",
            destination: "safehouse_1",
            description:
              "A battered side door leading back upstairs to Safehouse 1."
          }
        ]
      );
      assert.deepStrictEqual(
        location.items,
        ["protein_bar"]
      );
      assert.deepStrictEqual(
        location.npcs,
        []
      );
      assert.deepStrictEqual(
        location.objects,
        []
      );
    });
  }
);

test(
  "Saves only mutable location state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const templatePath = path.resolve(
        __dirname,
        "../../data/locations/back_alley_1.json"
      );

      const templateBefore = fs.readFileSync(
        templatePath,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadLocation, saveLocation } = require("./src/game/managers/locationManager");',
          'const location = loadLocation("back_alley_1");',
          'location.name = "Changed Name";',
          'location.description = "Changed description.";',
          "location.exits = [];",
          'location.items = ["unity_pistol"];',
          'location.npcs = ["finch", "test_npc"];',
          "location.objects = [];",
          "saveLocation(location);"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath = getLocationStatePath(
        savesDirectory,
        "back_alley_1"
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        {
          id: "back_alley_1",
          items: ["unity_pistol"],
          npcs: ["finch", "test_npc"],
          objects: []
        }
      );

      assert.strictEqual(
        fs.readFileSync(templatePath, "utf8"),
        templateBefore
      );
    });
  }
);

test(
  "Returns authored fields after saving runtime changes",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadLocation, saveLocation } = require("./src/game/managers/locationManager");',
          'const location = loadLocation("safehouse_1");',
          'location.name = "Runtime Name";',
          'location.items = ["protein_bar"];',
          "saveLocation(location);",
          'const reloaded = loadLocation("safehouse_1");',
          "process.stdout.write(JSON.stringify(reloaded));"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const location = JSON.parse(
        result.stdout
      );

      assert.strictEqual(
        location.name,
        "Safehouse 1"
      );
      assert.deepStrictEqual(
        location.items,
        ["protein_bar"]
      );
      assert.deepStrictEqual(
        location.objects,
        []
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