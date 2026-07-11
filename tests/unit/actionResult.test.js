const assert = require("assert");
const {
  ActionResult
} = require("../../src/game/results/actionResult");

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    console.log(`PASS  ${name}`);
    passed += 1;
  } catch (error) {
    console.log(`FAIL  ${name}`);
    console.error(error);
    failed += 1;
  }
}

console.log("================================");
console.log("ACTION RESULT TESTS");
console.log("================================");
console.log("");

test("Stores success, message and data", () => {
  const data = {
    locationId: "safehouse_1"
  };

  const result = new ActionResult({
    success: true,
    message: "You move.",
    data
  });

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.message, "You move.");
  assert.strictEqual(result.data, data);
});

test("Defaults data to an empty object", () => {
  const result = new ActionResult({
    success: false,
    message: "Unknown action."
  });

  assert.deepStrictEqual(result.data, {});
});

test("Stores elapsed minutes when supplied", () => {
  const result = new ActionResult({
    success: true,
    message: "You wait.",
    elapsedMinutes: 30
  });

  assert.strictEqual(result.elapsedMinutes, 30);
});

test("Omits elapsed minutes when not supplied", () => {
  const result = new ActionResult({
    success: true,
    message: "You look around."
  });

  assert.strictEqual(
    Object.prototype.hasOwnProperty.call(
      result,
      "elapsedMinutes"
    ),
    false
  );
});

test("Prevents result fields from being reassigned", () => {
  const result = new ActionResult({
    success: true,
    message: "You look around."
  });

  assert.strictEqual(Object.isFrozen(result), true);
});

test("Does not freeze result data", () => {
  const result = new ActionResult({
    success: true,
    message: "You look around.",
    data: {
      visibleItems: []
    }
  });

  result.data.visibleItems.push("item_1");

  assert.deepStrictEqual(
    result.data.visibleItems,
    ["item_1"]
  );
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
