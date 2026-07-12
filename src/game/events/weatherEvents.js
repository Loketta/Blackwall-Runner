"use strict";

const {
  formatWorldTime
} = require("../time/worldTimeFormatter");

const weatherStates = [
  "clear",
  "cloudy",
  "light rain",
  "heavy rain",
  "storm"
];

function recordWeatherChangedEvent(
  world,
  previousWeather,
  newWeather,
  services = {}
) {
  const eventRecorder = services.eventRecorder;

  if (!eventRecorder) {
    return null;
  }

  return eventRecorder.record({
    type: "WeatherChanged",
    worldTime: formatWorldTime(world),
    payload: {
      previousWeather,
      newWeather
    },
    metadata: {
      source: "weatherEvents"
    }
  });
}

function processWeatherEvents(world, services = {}) {
  const events = [];

  if (!world.weatherTimer) {
    world.weatherTimer = 0;
  }

  world.weatherTimer++;

  if (world.weatherTimer < 6) {
    return events;
  }

  world.weatherTimer = 0;

  const currentWeather = world.weather;
  const currentIndex = weatherStates.indexOf(currentWeather);

  if (currentIndex === -1) {
    return events;
  }

  const random = services.random ?? Math.random;
  const roll = random();

  let nextIndex = currentIndex;

  if (roll < 0.33) {
    nextIndex = Math.max(0, currentIndex - 1);
  } else if (roll > 0.66) {
    nextIndex = Math.min(
      weatherStates.length - 1,
      currentIndex + 1
    );
  }

  if (nextIndex === currentIndex) {
    return events;
  }

  const newWeather = weatherStates[nextIndex];
  world.weather = newWeather;

  const event = recordWeatherChangedEvent(
    world,
    currentWeather,
    newWeather,
    services
  );

  if (event) {
    events.push(event);
  }

  return events;
}

module.exports = {
  processWeatherEvents,
  recordWeatherChangedEvent
};
