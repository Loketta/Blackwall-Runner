"use strict";

const assert = require("assert");
const path = require("path");
const {
  DEFAULT_SHOPS_FILE,
  getShopsDirectory,
  getShopStateFilePath
} = require(
  "../../src/game/world/shopStatePaths"
);

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

console.log("================================");
console.log("SHOP STATE PATH TESTS");
console.log("================================");
console.log("");

test(
  "Defines the default shops file",
  () => {
    assert.strictEqual(
      DEFAULT_SHOPS_FILE,
      "shops.json"
    );
  }
);

test(
  "Builds the default shops directory",
  () => {
    assert.strictEqual(
      getShopsDirectory(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "shops"
      )
    );
  }
);

test(
  "Builds the default shop state path",
  () => {
    assert.strictEqual(
      getShopStateFilePath(),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "shops",
        "shops.json"
      )
    );
  }
);

test(
  "Supports a custom world identifier",
  () => {
    assert.strictEqual(
      getShopStateFilePath({
        worldId: "world-2"
      }),
      path.join(
        "saves",
        "worlds",
        "world-2",
        "state",
        "shops",
        "shops.json"
      )
    );
  }
);

test(
  "Supports a custom saves directory",
  () => {
    assert.strictEqual(
      getShopStateFilePath({
        savesDirectory: "runtime-saves"
      }),
      path.join(
        "runtime-saves",
        "worlds",
        "development-world",
        "state",
        "shops",
        "shops.json"
      )
    );
  }
);

test(
  "Supports a custom shops file",
  () => {
    assert.strictEqual(
      getShopStateFilePath({
        shopsFile: "market.json"
      }),
      path.join(
        "saves",
        "worlds",
        "development-world",
        "state",
        "shops",
        "market.json"
      )
    );
  }
);

test(
  "Rejects an empty shops file",
  () => {
    assert.throws(
      () => getShopStateFilePath({
        shopsFile: ""
      }),
      /shopsFile must be a non-empty string/
    );
  }
);

test(
  "Rejects an unsafe shops file",
  () => {
    assert.throws(
      () => getShopStateFilePath({
        shopsFile: "../shops.json"
      }),
      /shopsFile contains invalid path characters/
    );
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