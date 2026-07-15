"use strict";

const assert = require("assert");

const {
  validateProfessionSelection
} = require("../../src/game/characterCreation/professionSelectionValidator");

const tests = [];

function test(name, callback) {
  tests.push({
    name,
    callback
  });
}

test("Requires a profession", () => {
  assert.deepStrictEqual(
    validateProfessionSelection(null, {}),
    {
      valid: false,
      errors: [
        {
          field: "profession",
          code: "profession_required",
          message: "A profession must be selected."
        }
      ]
    }
  );
});

test("Rejects an unknown profession", () => {
  assert.deepStrictEqual(
    validateProfessionSelection(
      "unknown_profession",
      {}
    ),
    {
      valid: false,
      errors: [
        {
          field: "profession",
          code: "unknown_profession",
          message:
            "Unknown profession: unknown_profession"
        }
      ]
    }
  );
});

test("Accepts a profession without choices", () => {
  assert.deepStrictEqual(
    validateProfessionSelection("medic", {}),
    {
      valid: true,
      errors: []
    }
  );
});

test("Rejects invalid profession choice storage", () => {
  const result = validateProfessionSelection(
    "medic",
    null
  );

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors[0].code,
    "invalid_profession_choices"
  );
});

test("Rejects irrelevant profession choices", () => {
  const result = validateProfessionSelection(
    "medic",
    {
      weapon_type: "pistols"
    }
  );

  assert.deepStrictEqual(result, {
    valid: false,
    errors: [
      {
        field: "professionChoices.weapon_type",
        code: "unexpected_profession_choice",
        message:
          "Medic does not use the weapon_type choice."
      }
    ]
  });
});

test("Requires the Operator weapon type", () => {
  const result = validateProfessionSelection(
    "operator",
    {}
  );

  assert.deepStrictEqual(result, {
    valid: false,
    errors: [
      {
        field: "professionChoices.weapon_type",
        code: "required_profession_choice",
        message:
          "Operator requires a weapon_type selection."
      }
    ]
  });
});

test("Rejects an empty Operator weapon type", () => {
  const result = validateProfessionSelection(
    "operator",
    {
      weapon_type: "   "
    }
  );

  assert.strictEqual(result.valid, false);
  assert.strictEqual(
    result.errors[0].code,
    "required_profession_choice"
  );
});

test("Rejects an unknown Operator weapon type", () => {
  assert.deepStrictEqual(
    validateProfessionSelection(
      "operator",
      {
        weapon_type: "laser_swords"
      }
    ),
    {
      valid: false,
      errors: [
        {
          field: "professionChoices.weapon_type",
          code: "unknown_weapon_type",
          message:
            "Unknown weapon type: laser_swords"
        }
      ]
    }
  );
});

test("Accepts a controlled Operator weapon type", () => {
  assert.deepStrictEqual(
    validateProfessionSelection(
      "operator",
      {
        weapon_type: "sniper_rifles"
      }
    ),
    {
      valid: true,
      errors: []
    }
  );
});

async function run() {
  console.log("================================");
  console.log("PROFESSION SELECTION VALIDATOR TESTS");
  console.log("================================");

  let passed = 0;

  for (const currentTest of tests) {
    try {
      await currentTest.callback();
      passed += 1;
      console.log(`PASS ${currentTest.name}`);
    } catch (error) {
      console.error(`FAIL ${currentTest.name}`);
      console.error(error);
      process.exitCode = 1;
    }
  }

  console.log("================================");
  console.log(`${passed} passed`);
  console.log(`${tests.length - passed} failed`);
  console.log("================================");
}

run();