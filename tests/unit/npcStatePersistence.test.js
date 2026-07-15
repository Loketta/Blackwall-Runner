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
      "blackwall-npc-state-"
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

function getNpcStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "npcs",
    "npcs.json"
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
console.log("NPC STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test(
  "Seeds missing NPC state from the template",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadNpcs } = require("./src/game/managers/npcManager");',
          "loadNpcs();"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath =
        getNpcStatePath(savesDirectory);

      const templatePath = path.resolve(
        __dirname,
        "../../data/npcs/npcs.json"
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
  "Reuses existing NPC state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getNpcStatePath(savesDirectory);

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const existingNpcs = [
        {
          id: "saved_npc",
          name: "Saved NPC",
          description: "Persisted NPC state.",
          role: "contact",
          dialogue: "This came from the world save."
        }
      ];

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(existingNpcs, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadNpcs } = require("./src/game/managers/npcManager");',
          "const npcs = loadNpcs();",
          "process.stdout.write(JSON.stringify(npcs));"
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
        existingNpcs
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        existingNpcs
      );
    });
  }
);

test(
  "Loads an NPC by identifier from world-scoped state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getNpcStatePath(savesDirectory);

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const npcs = [
        {
          id: "finch",
          name: "Saved Finch",
          description: "World-scoped Finch.",
          role: "courier",
          dialogue: "Persisted dialogue."
        },
        {
          id: "marches",
          name: "Saved Marches",
          description: "World-scoped Marches.",
          role: "fixer",
          dialogue: "Persisted fixer dialogue."
        }
      ];

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(npcs, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadNpc } = require("./src/game/managers/npcManager");',
          'const npc = loadNpc("marches");',
          "process.stdout.write(JSON.stringify(npc));"
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
        npcs[1]
      );
    });
  }
);

test(
  "Does not modify the NPC template",
  () => {
    withTemporarySaves((savesDirectory) => {
      const templatePath = path.resolve(
        __dirname,
        "../../data/npcs/npcs.json"
      );

      const templateBefore = fs.readFileSync(
        templatePath,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadNpcs } = require("./src/game/managers/npcManager");',
          "loadNpcs();"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      assert.strictEqual(
        fs.readFileSync(templatePath, "utf8"),
        templateBefore
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