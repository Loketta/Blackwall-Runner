const assert = require("node:assert/strict");
const {
  advanceSimulation
} = require("../../src/game/simulation/simulationEngine");

let passed = 0;
let failed = 0;

function test(name, testFunction) {
  try {
    testFunction();
    passed += 1;
    console.log(`PASS  ${name}`);
  } catch (error) {
    failed += 1;
    console.error(`FAIL  ${name}`);
    console.error(`      ${error.message}`);
  }
}

function createWorld(overrides = {}) {
  return {
    day: 1,
    currentTime: "10:00",
    weather: "clear",
    weatherTimer: 0,
    calendar: {
      year: 2045,
      month: 1,
      dayOfMonth: 1
    },
    scheduledEvents: [],
    ...overrides
  };
}

console.log("================================");
console.log("SIMULATION ENGINE TESTS");
console.log("================================");
console.log("");

test("Zero minutes does not advance world time", function () {
  const world = createWorld();

  const result = advanceSimulation(world, 0);

  assert.equal(world.day, 1);
  assert.equal(world.currentTime, "10:00");
  assert.equal(result.elapsedMinutes, 0);
});

test("Zero minutes does not process background events", function () {
  const world = createWorld({
    weatherTimer: 5
  });

  const result = advanceSimulation(world, 0);

  assert.equal(world.weatherTimer, 5);
  assert.deepEqual(result.events, []);
});

test("Positive minutes advances world time", function () {
  const world = createWorld();

  const result = advanceSimulation(world, 15);

  assert.equal(world.currentTime, "10:15");
  assert.equal(result.elapsedMinutes, 15);
  assert.ok(Array.isArray(result.events));
});

test("Time advancement crosses midnight correctly", function () {
  const world = createWorld({
    currentTime: "23:50"
  });

  advanceSimulation(world, 20);

  assert.equal(world.day, 2);
  assert.equal(world.currentTime, "00:10");
  assert.equal(world.calendar.dayOfMonth, 2);
});

test("Negative minutes are rejected", function () {
  const world = createWorld();

  assert.throws(
    function () {
      advanceSimulation(world, -1);
    },
    /non-negative integer/
  );
});

test("Fractional minutes are rejected", function () {
  const world = createWorld();

  assert.throws(
    function () {
      advanceSimulation(world, 1.5);
    },
    /non-negative integer/
  );
});

test("Non-numeric minutes are rejected", function () {
  const world = createWorld();

  assert.throws(
    function () {
      advanceSimulation(world, "5");
    },
    /non-negative integer/
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