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
      "blackwall-world-object-state-"
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

function getWorldObjectStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "worldObjects",
    "worldObjects.json"
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
console.log("WORLD OBJECT STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test(
  "Seeds missing world object state from the template",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadWorldObjects } = require("./src/game/managers/worldObjectManager");',
          "loadWorldObjects();"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath =
        getWorldObjectStatePath(savesDirectory);

      const templatePath = path.resolve(
        __dirname,
        "../../data/worldObjects/worldObjects.json"
      );

      assert.strictEqual(
        fs.existsSync(statePath),
        true
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        JSON.parse(
          fs.readFileSync(templatePath, "utf8")
        )
      );
    });
  }
);

test(
  "Reuses existing world object state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getWorldObjectStatePath(savesDirectory);

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const existingWorldObjects = [
        {
          id: "saved_door",
          type: "door",
          name: "Saved Door",
          description: "A persisted test door.",
          locationId: "safehouse_1",
          state: {
            isOpen: false,
            isLocked: true
          },
          inventory: []
        }
      ];

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(existingWorldObjects, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadWorldObjects } = require("./src/game/managers/worldObjectManager");',
          "const objects = loadWorldObjects();",
          "process.stdout.write(JSON.stringify(objects));"
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
        existingWorldObjects
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        existingWorldObjects
      );
    });
  }
);

test(
  "Saves changes to world-scoped world object state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getWorldObjectStatePath(savesDirectory);

      const templatePath = path.resolve(
        __dirname,
        "../../data/worldObjects/worldObjects.json"
      );

      const templateBefore = fs.readFileSync(
        templatePath,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadWorldObject, saveWorldObject } = require("./src/game/managers/worldObjectManager");',
          'const object = loadWorldObject("alley_crate");',
          "object.state.isOpen = false;",
          "object.state.isLocked = true;",
          'object.inventory = ["protein_bar", "unity_pistol"];',
          "const saved = saveWorldObject(object);",
          "if (!saved) { process.exitCode = 1; }"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const savedObjects = JSON.parse(
        fs.readFileSync(statePath, "utf8")
      );

      const savedCrate = savedObjects.find(
        (worldObject) => {
          return worldObject.id === "alley_crate";
        }
      );

      assert.ok(savedCrate);
      assert.strictEqual(
        savedCrate.state.isOpen,
        false
      );
      assert.strictEqual(
        savedCrate.state.isLocked,
        true
      );
      assert.deepStrictEqual(
        savedCrate.inventory,
        ["protein_bar", "unity_pistol"]
      );

      assert.strictEqual(
        fs.readFileSync(templatePath, "utf8"),
        templateBefore
      );
    });
  }
);

test(
  "Saves complete world object collections",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getWorldObjectStatePath(savesDirectory);

      const replacementObjects = [
        {
          id: "replacement_terminal",
          type: "terminal",
          name: "Replacement Terminal",
          description: "A replacement collection entry.",
          locationId: "safehouse_1",
          state: {
            powered: true
          },
          inventory: []
        }
      ];

      const encodedObjects = Buffer.from(
        JSON.stringify(replacementObjects),
        "utf8"
      ).toString("base64");

      const result = runNode(
        [
          'const { saveWorldObjects } = require("./src/game/managers/worldObjectManager");',
          `const objects = JSON.parse(Buffer.from("${encodedObjects}", "base64").toString("utf8"));`,
          "saveWorldObjects(objects);"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        replacementObjects
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