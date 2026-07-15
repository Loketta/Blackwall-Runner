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
      "blackwall-shop-state-"
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

function getShopStatePath(savesDirectory) {
  return path.join(
    savesDirectory,
    "worlds",
    "development-world",
    "state",
    "shops",
    "shops.json"
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
console.log("SHOP STATE PERSISTENCE TESTS");
console.log("================================");
console.log("");

test(
  "Seeds missing shop state from the template",
  () => {
    withTemporarySaves((savesDirectory) => {
      const result = runNode(
        [
          'const { loadShops } = require("./src/game/managers/shopManager");',
          "loadShops();"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const statePath =
        getShopStatePath(savesDirectory);

      const templatePath = path.resolve(
        __dirname,
        "../../data/Shops/shops.json"
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
  "Reuses existing shop state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getShopStatePath(savesDirectory);

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const existingShops = [
        {
          id: "saved_shop",
          name: "Saved Shop",
          description: "Persisted shop state.",
          locationId: "safehouse_1",
          isOpen: false,
          stock: []
        }
      ];

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(existingShops, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadShops } = require("./src/game/managers/shopManager");',
          "const shops = loadShops();",
          "process.stdout.write(JSON.stringify(shops));"
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
        existingShops
      );

      assert.deepStrictEqual(
        JSON.parse(
          fs.readFileSync(statePath, "utf8")
        ),
        existingShops
      );
    });
  }
);

test(
  "Saves changes to world-scoped shop state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getShopStatePath(savesDirectory);

      const templatePath = path.resolve(
        __dirname,
        "../../data/Shops/shops.json"
      );

      const templateBefore = fs.readFileSync(
        templatePath,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadShops, saveShops } = require("./src/game/managers/shopManager");',
          "const shops = loadShops();",
          "shops[0].isOpen = false;",
          "shops[0].stock[0].price = 25;",
          "saveShops(shops);"
        ].join(" "),
        savesDirectory
      );

      assert.strictEqual(
        result.status,
        0,
        result.stderr
      );

      const savedShops = JSON.parse(
        fs.readFileSync(statePath, "utf8")
      );

      assert.strictEqual(
        savedShops[0].isOpen,
        false
      );

      assert.strictEqual(
        savedShops[0].stock[0].price,
        25
      );

      assert.strictEqual(
        fs.readFileSync(templatePath, "utf8"),
        templateBefore
      );
    });
  }
);

test(
  "Loads shops at a location from world-scoped state",
  () => {
    withTemporarySaves((savesDirectory) => {
      const statePath =
        getShopStatePath(savesDirectory);

      fs.mkdirSync(
        path.dirname(statePath),
        { recursive: true }
      );

      const shops = [
        {
          id: "alley_shop",
          name: "Alley Shop",
          description: "An alley shop.",
          locationId: "back_alley_1",
          isOpen: true,
          stock: []
        },
        {
          id: "safehouse_shop",
          name: "Safehouse Shop",
          description: "A safehouse shop.",
          locationId: "safehouse_1",
          isOpen: true,
          stock: []
        }
      ];

      fs.writeFileSync(
        statePath,
        `${JSON.stringify(shops, null, 2)}\n`,
        "utf8"
      );

      const result = runNode(
        [
          'const { loadShopsAtLocation } = require("./src/game/managers/shopManager");',
          'const shops = loadShopsAtLocation("safehouse_1");',
          "process.stdout.write(JSON.stringify(shops));"
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
        [shops[1]]
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