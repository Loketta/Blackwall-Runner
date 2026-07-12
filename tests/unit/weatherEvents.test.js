"use strict";

const assert = require("assert");
const {
  processWeatherEvents,
  recordWeatherChangedEvent
} = require("../../src/game/events/weatherEvents");

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

function createWorld(overrides = {}) {
  return {
    currentTime: "03:35",
    weather: "cloudy",
    weatherTimer: 5,
    calendar: {
      year: 2045,
      month: 1,
      dayOfMonth: 2
    },
    ...overrides
  };
}

console.log("================================");
console.log("WEATHER EVENT TESTS");
console.log("================================");
console.log("");

test("Records a WeatherChanged event", () => {
  let recordedData = null;
  const recordedEvent = {
    eventId: "event_1"
  };

  const result = recordWeatherChangedEvent(
    createWorld(),
    "cloudy",
    "light rain",
    {
      eventRecorder: {
        record(data) {
          recordedData = data;
          return recordedEvent;
        }
      }
    }
  );

  assert.strictEqual(result, recordedEvent);
  assert.deepStrictEqual(recordedData, {
    type: "WeatherChanged",
    worldTime: "2045-01-02T03:35:00",
    payload: {
      previousWeather: "cloudy",
      newWeather: "light rain"
    },
    metadata: {
      source: "weatherEvents"
    }
  });
});

test("Changes weather and returns the recorded event", () => {
  const world = createWorld();
  const recordedEvent = {
    eventId: "event_1"
  };

  const events = processWeatherEvents(world, {
    random() {
      return 0.9;
    },
    eventRecorder: {
      record() {
        return recordedEvent;
      }
    }
  });

  assert.strictEqual(world.weather, "light rain");
  assert.deepStrictEqual(events, [recordedEvent]);
});

test("Does not record when no recorder is supplied", () => {
  const world = createWorld();

  const events = processWeatherEvents(world, {
    random() {
      return 0.9;
    }
  });

  assert.strictEqual(world.weather, "light rain");
  assert.deepStrictEqual(events, []);
});

test("Does not process weather before the timer is due", () => {
  const world = createWorld({
    weatherTimer: 4
  });

  let randomWasCalled = false;

  const events = processWeatherEvents(world, {
    random() {
      randomWasCalled = true;
      return 0.9;
    }
  });

  assert.strictEqual(world.weatherTimer, 5);
  assert.strictEqual(world.weather, "cloudy");
  assert.strictEqual(randomWasCalled, false);
  assert.deepStrictEqual(events, []);
});

test("Does not record when the weather remains unchanged", () => {
  const world = createWorld();

  let recordWasCalled = false;

  const events = processWeatherEvents(world, {
    random() {
      return 0.5;
    },
    eventRecorder: {
      record() {
        recordWasCalled = true;
      }
    }
  });

  assert.strictEqual(world.weather, "cloudy");
  assert.strictEqual(recordWasCalled, false);
  assert.deepStrictEqual(events, []);
});

test("Does not process an unrecognised weather state", () => {
  const world = createWorld({
    weather: "unknown"
  });

  let recordWasCalled = false;

  const events = processWeatherEvents(world, {
    random() {
      return 0.9;
    },
    eventRecorder: {
      record() {
        recordWasCalled = true;
      }
    }
  });

  assert.strictEqual(world.weather, "unknown");
  assert.strictEqual(recordWasCalled, false);
  assert.deepStrictEqual(events, []);
});

console.log("");
console.log("================================");
console.log(`${passed} passed`);
console.log(`${failed} failed`);
console.log("================================");

if (failed > 0) {
  process.exitCode = 1;
}
